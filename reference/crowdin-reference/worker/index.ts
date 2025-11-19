import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app';

let handler: ExportedHandler | undefined;
let appInstance: ReturnType<typeof createApp> | undefined;

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
    app.listen(port);
    handler = httpServerHandler({ port });

    return handler;
}

async function handleCronEvent(env: CloudflareEnv, cron: string): Promise<void> {
    const { crowdinApp } = initializeApp(env);
    const { cronExecutions = {} } = crowdinApp;
    
    const cronHandler = cronExecutions[cron];

    if (!cronHandler) {
        return;
    }
    
    await cronHandler();
}

export default {
    async fetch(request: Request<unknown, IncomingRequestCfProperties>, env: CloudflareEnv, ctx: ExecutionContext) {
        return initializeHandler(env).fetch!(request, env, ctx);
    },

    async scheduled(controller: ScheduledController, env: CloudflareEnv): Promise<void> {
        await handleCronEvent(env, controller.cron);
    }
}