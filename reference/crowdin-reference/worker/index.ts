// Extend global namespace for Node.js compatibility
declare global {
    var __dirname: string;
    var __filename: string;
  }
  
  globalThis.__dirname = globalThis.__dirname || '/';
  globalThis.__filename = globalThis.__filename || 'index.ts';

import { httpServerHandler } from 'cloudflare:node';

let handler: ExportedHandler | undefined;

async function initializeHandler(env: CloudflareEnv): Promise<ExportedHandler> {
    if (handler) {
        return handler;
    }

    const appFactory = await import('./app');
    const app = appFactory.createApp(env);

    const port: number = 3000;
    app.listen(port);
    handler = httpServerHandler({ port });

    return handler;
}

export default {
    async fetch(request: Request<unknown, IncomingRequestCfProperties>, env: CloudflareEnv, ctx: ExecutionContext) {
        return (await initializeHandler(env)).fetch!(request, env, ctx);
    }
}