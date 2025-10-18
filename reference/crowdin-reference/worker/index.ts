import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app';

let handler: ExportedHandler | undefined;

function initializeHandler(env: CloudflareEnv): ExportedHandler {
    if (handler) {
        return handler;
    }

    const { expressApp: app } = createApp(env);
    const port: number = 3000;
    app.listen(port);
    handler = httpServerHandler({ port });

    return handler;
}

async function handleCronEvent(env: CloudflareEnv, cron: string): Promise<void> {
    const { cronExecutions = {} } = createApp(env).crowdinApp;
    await cronExecutions[cron]();
}

export default {
    async fetch(request: Request<unknown, IncomingRequestCfProperties>, env: CloudflareEnv, ctx: ExecutionContext) {
        return initializeHandler(env).fetch!(request, env, ctx);
    },

    async scheduled(event: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext): Promise<void> {
        await handleCronEvent(env, event.cron);
    }
}