import cors from 'cors';
import path from 'node:path';
import express from 'express';
import {fileURLToPath} from 'node:url';
import routes from './routes/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/node_modules/axios', express.static(path.join(__dirname, 'node_modules/axios')));
app.use('/', express.static(path.join(__dirname, 'client/dist'), {extensions: ['html']}));

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log('http://localhost:' + port);
});

