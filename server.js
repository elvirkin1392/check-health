import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use('/node_modules/axios', express.static(path.join(__dirname, 'node_modules/axios')));
app.use('/', express.static(path.join(__dirname, 'static'), {extensions: ['html']}));

app.get("/api/users", async function (_, res) {
    let summary;
    // axios.get('https://api.telegram.org/bot<tocken>/getUpdates')
    //     .then((response) => {
    //         console.log(response.data);
    //     })
    //     .catch(function (error) {
    //         console.log("Error getUpdates", error);
    //     })
    // await https.get('https://api.telegram.org/bot<tocken>/getUpdates', res => {
    //     console.log('Status Code:', res.statusCode);
    //     let data = [];
    //     res.on('data', chunk => {
    //         data.push(chunk);
    //     });
    //
    //     res.on('end', () => {
    //         const result = JSON.parse(Buffer.concat(data).toString());
    //         for (let i = 0; i < result.result.length; i++) {
    //             console.log('text: ', result.result[i].message.chat.id);
    //         }
    //         summary = result;
    //     });
    // }).on('error', err => {
    //     console.log('Error: ', err.message);
    // });
    console.log('GET: api/users');
    res.send(JSON.stringify(summary));
});
app.get('/api/switchOnWebhook', function (req, res) {
    axios.post('https://api.telegram.org/bot<tocken>/setWebhook', {
        url: 'https://check-health-417373288113.europe-north1.run.app/api/listenWebHook'
    }).catch((error) => {
        res.send('error switchOffWebhook', error)
    });

    res.send('ok')
})

app.get('/api/switchOffWebhook', function (req, res) {
    axios.post('https://api.telegram.org/bot<tocken>/setWebhook', {
        url: ''
    }).catch((error) => {
        res.send('error switchOffWebhook', error)
    });

    res.send('ok')
})


let data = {
    'test': 'test'
};
app.post('/api/listenWebHook', function (req, res) {
    const result = req.body;
    console.log('listenWebHook', result);

    if (result && result.update_id) {
        console.log('result.update_id', result.update_id);
        data[result.update_id] = result.message ? result.message.text : result.edited_message.text;
    }
    res.json({
        message: 'ok'
    });
})
app.get('/api/getUpdates', (_, res) => {
    console.log('getUpdates', data);

    axios.get('https://api.telegram.org/bot<tocken>/getWebhookInfo')
        .then((response) => {
            console.log('getWebhookInfo',response.data);
        })
        .catch(function (error) {
            console.log("Error getWebhookInfo", error);
        })

    res.send(JSON.stringify(data));
})
app.post('/api/sendMessage', function (req, res) {
    axios.post('https://api.telegram.org/bot<tocken>/sendMessage', {
        chat_id: 'chat_id',
        text: 'update'
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

    res.send('sent');
})

// app.post("/api/users", function (req, res) {
//
//     if (!req.body) return res.sendStatus(400);
//
//     const userName = req.body.name;
//     const userAge = req.body.age;
//     const user = {name: userName, age: userAge};
//     // присваиваем идентификатор из переменной id и увеличиваем ее на единицу
//     user.id = Date.now();
//     // добавляем пользователя в базу
//
//     res.send(user);
// });

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
    console.log('http://localhost:' + port);
});

