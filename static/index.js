import axios from "./node_modules/axios/dist/esm/axios.min.js";

const button = document.getElementById('button');
const sendMessage = document.getElementById('sendMessage');
const result = document.getElementById('result');
const onWebhook = document.getElementById('onWebhook');
const offWebhook = document.getElementById('offWebhook');
const getUpdates = document.getElementById('getUpdates');
const updates = document.getElementById('updates');

button.addEventListener('click', () => {
    fetch('/api/users')
        .then(response => response.json())
        .then(response => {
            result.innerText = response.toString();
        });
})

sendMessage.addEventListener('click', () => {
    fetch('/api/sendMessage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: 'message'})
    })
        .then(response => response.json())
        .then(response => {
            result.innerText = response.toString();
        });
})
onWebhook.addEventListener('click', () => {
    fetch('/api/switchOnWebhook')
        .then(response => response.json())
        .then(response => {
            result.innerText = response.toString();
        });
})
offWebhook.addEventListener('click', () => {
    fetch('/api/switchOffWebhook')
        .then(response => response.json())
        .then(response => {
            result.innerText = response.toString();
        });
})
getUpdates.addEventListener('click', () => {
    fetch('/api/getUpdates')
        .then(response => response.json())
        .then(response => {
            if(response) {
                updates.innerText = Object.values(response).concat().toString()
                ;
            }

        });
})