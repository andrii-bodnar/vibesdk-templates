declare module 'cloudflare:node' {
    interface NodeStyleServer {
        listen(...args: unknown[]): this;
        address(): {
            port?: number | null | undefined;
        };
    }
    export function httpServerHandler(port: number): import("@cloudflare/workers-types").ExportedHandler;
    export function httpServerHandler(options: {
        port: number;
    }): import("@cloudflare/workers-types").ExportedHandler;
    export function httpServerHandler(server: NodeStyleServer): import("@cloudflare/workers-types").ExportedHandler;
}