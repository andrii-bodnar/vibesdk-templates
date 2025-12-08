import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app';
import type { Cron } from '@crowdin/app-project-module/out/types';
import type { Server } from 'node:http';
import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';

// Close previous server on HMR reload
const previousServer = (globalThis as any).__previousServer as Server | undefined;
if (previousServer) {
    previousServer.close();
}

// Module-scoped state (fresh on each module load)
let handler: ExportedHandler | undefined;
let appInstance: ReturnType<typeof createApp> | undefined;

class CloudflareCron implements Cron {
    private handlers: Map<string, Array<() => Promise<void>>> = new Map();

    schedule(expression: string, task: () => Promise<void>): void {
        if (!this.handlers.has(expression)) {
            this.handlers.set(expression, []);
        }
        this.handlers.get(expression)?.push(task);
    }

    async runScheduled(expression: string): Promise<void> {
        const tasks = this.handlers.get(expression) || [];
        await Promise.allSettled(tasks.map(task => task()));
    }
}

const cron = new CloudflareCron();

function initializeApp(env: CloudflareEnv): ReturnType<typeof createApp> {
    if (appInstance) {
        return appInstance;
    }

    appInstance = createApp({
        clientId: env.CROWDIN_CLIENT_ID,
        clientSecret: env.CROWDIN_CLIENT_SECRET,
        assetsConfig: {
            fetcher: env.ASSETS,
        },
        d1Config: {
            database: env.DB,
        },
        fileStore: {
            getFile: async (fileId: string): Promise<Buffer> => {
                const data = await env.KVStore.get(fileId, 'arrayBuffer');
                if (!data) {
                    throw new Error(`File not found: ${fileId}`);
                }
                return Buffer.from(data);
            },
            storeFile: async (content: Buffer): Promise<string> => {
                const fileId = `file_${crypto.randomUUID()}`;
                await env.KVStore.put(fileId, content, { expirationTtl: 86400 });
                return fileId;
            },
            deleteFile: async (fileId: string): Promise<void> => {
                await env.KVStore.delete(fileId);
            }
        },
        cron
    });
    appInstance.expressApp.set('etag', false);

    // Simple koa-style request logger
    appInstance.expressApp.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
      const start = Date.now();
      const path = req.url?.split('?')[0];
      
      console.log(`<-- ${req.method} ${path}`);
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`--> ${req.method} ${path} ${res.statusCode} ${duration}ms`);
      });
      
      next();
    });

    appInstance.expressApp.get('/api/health', async (req: ExpressRequest, res: ExpressResponse) => {
      return res.status(200).json({ 
        success: true,
        data: {
          status: 'healthy', 
          timestamp: new Date().toISOString()
        }
       });
    });
  
    appInstance.expressApp.post('/api/client-errors', async (req: ExpressRequest, res: ExpressResponse) => {
      try {
        const { timestamp, message, url, stack, componentStack, errorBoundary } = req.body || {};
        
        console.error('[CLIENT ERROR]', JSON.stringify({
          timestamp: timestamp || new Date().toISOString(),
          message: message,
          url: url,
          stack: stack,
          componentStack: componentStack,
          errorBoundary: errorBoundary
        }, null, 2));
  
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('[CLIENT ERROR HANDLER] Failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to process' });
      }
    });

    return appInstance;
}

function initializeHandler(env: CloudflareEnv): ExportedHandler {
    if (handler) {
        return handler;
    }

    const { expressApp: app } = initializeApp(env);
    const port: number = 3000;
    // Store for cleanup on next HMR reload
    (globalThis as any).__previousServer = app.listen(port);
    handler = httpServerHandler({ port });

    return handler;
}

export default {
    async fetch(request: Request<unknown, IncomingRequestCfProperties>, env: CloudflareEnv, ctx: ExecutionContext) {
        const url = new URL(request.url);
        
        // Handle scheduled cron trigger via HTTP endpoint
        if (url.pathname === '/__scheduled' && request.method === 'GET') {
            // Verify scheduled secret header
            const scheduledSecret = request.headers.get('X-Cloudflare-Scheduled-Secret');
            if (!scheduledSecret || scheduledSecret !== env.SCHEDULED_SECRET) {
                return new Response('Unauthorized', { status: 401 });
            }
            
            const cronExpression = url.searchParams.get('cron');
            
            if (!cronExpression) {
                return new Response('Missing cron parameter', { status: 400 });
            }
            
            try {
                // Initialize app to ensure cron tasks are registered
                initializeApp(env);
                
                // Run scheduled tasks for the given cron expression
                await cron.runScheduled(cronExpression.replace(/\+/g, ' '));
                
                return new Response('Scheduled tasks executed successfully', { status: 200 });
            } catch (error) {
                console.error('Error executing scheduled tasks:', error);
                return new Response('Error executing scheduled tasks', { status: 500 });
            }
        }
        
        return initializeHandler(env).fetch!(request, env, ctx);
    },
    async scheduled(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
		console.log(`Cron triggered: ${controller.cron}`);

        try {
            // Initialize app to ensure cron tasks are registered
            initializeApp(env);
            
            // Run scheduled tasks for the given cron expression
            await cron.runScheduled(controller.cron);
        } catch (error) {
            console.error('Error executing scheduled tasks:', error);
        }
	},
}