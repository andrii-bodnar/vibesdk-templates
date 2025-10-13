var _a;
import { httpServerHandler } from 'cloudflare:node';
import { sendFilePolyfill } from './middleware/sendFilePolyfill.js';
globalThis.__dirname = globalThis.__dirname || ((_a = process.cwd) === null || _a === void 0 ? void 0 : _a.call(process)) || '/';
globalThis.__filename = globalThis.__filename || 'index.ts';
// Import Crowdin module with proper typing
const crowdinModule = await import('@crowdin/app-project-module');
const app = crowdinModule.express();
app.use(sendFilePolyfill);
const configuration = {
    name: "Crowdin App",
    identifier: "crowdin-app",
    description: "A Crowdin app built with the SDK",
    enableStatusPage: {
        database: false,
        filesystem: false
    },
    dbFolder: __dirname + '/data',
    imagePath: __dirname + '/public/logo.svg',
    // Default module configurations will be overridden by specific templates
};
app.post('/installed', (req, res) => {
    res.status(204).end();
});
app.post('/uninstall', (req, res) => {
    res.status(204).end();
});
// Initialize Crowdin app
crowdinModule.addCrowdinEndpoints(app, configuration);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
const port = Number(process.env.PORT) || 3000;
app.listen(port);
export default httpServerHandler({ port });
