import cors from 'cors';
import path from 'node:path';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {users} from "./mock.js";
import routes from './routes/routes.js'
import {sendTGMessage} from './telegramBot/telegram.service.js'

const CHAT_ID = process.env.CHECK_HEALTH_CHAT_ID;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

app.use('/node_modules/axios', express.static(path.join(__dirname, 'node_modules/axios')));
app.use('/', express.static(path.join(__dirname, 'client/dist'), {extensions: ['html']}));

app.get('/api/test', (_, res) => {
    users.mrshomesoul.authorization = {
        status: 'ready', //ready, pending, null
        isAuthenticated: true
    };
    res.send('ok')
})
//
// app.post('/api/sendMessage', async function (req, res) {
//     await sendTGMessage({id: CHAT_ID, message: 'hello'})
//
//     res.send('sent');
// })


const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log('http://localhost:' + port);
});

