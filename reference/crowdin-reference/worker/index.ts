import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app';

let handler: ExportedHandler | undefined;

function initializeHandler(): ExportedHandler {
    if (handler) {
        return handler;
    }

    const app = createApp();

    const port: number = 3000;
    app.listen(port);
    handler = httpServerHandler({ port });

    return handler;
}

export default {
    async fetch(request: Request<unknown, IncomingRequestCfProperties>, env: CloudflareEnv, ctx: ExecutionContext) {
        return initializeHandler().fetch!(request, env, ctx);
    }
}