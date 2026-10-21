import cors from 'cors';
import path from 'node:path';
import express from 'express';
import {fileURLToPath} from 'node:url';
import routes from './routes/routes.tsx';
import {restoreJobs} from './cron/main.tsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// server.tsx lives in server/, but node_modules and the built client both sit at
// the repository root — hoisted there by npm workspaces.
const repoRoot = path.join(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/node_modules/axios', express.static(path.join(repoRoot, 'node_modules/axios')));
app.use('/', express.static(path.join(repoRoot, 'client/dist'), {extensions: ['html']}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log('http://localhost:' + port);
});

restoreJobs().catch((error) => console.error('Failed to restore cron jobs', error));

