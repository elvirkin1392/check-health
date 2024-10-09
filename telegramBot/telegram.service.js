import axios from "axios";
import {createUser, updateUser, updateUserLoginStatus} from '../routes/auth/auth.service.js'
import {users} from "../mock.js";

const TG_TOKEN = process.env.CHECK_HEALTH_TELEGRAM_BOT_TOKEN;
const switchOnTGWebhook = () => {
    return axios.post(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
        url: 'https://check-health-417373288113.europe-north1.run.app/api/listenWebHook'
    }).catch((error) => {
        return (error)
    });
}

const switchOffTGWebhook = () => {
    return axios.get(`https://api.telegram.org/bot${TG_TOKEN}/getWebhookInfo`)
        .then((response) => {
            console.log('getWebhookInfo', response.data);
        })
        .catch(function (error) {
            console.log("Error getWebhookInfo", error);
            return (error)
        });
}

const getTGWebhookInfo = () => {
    return axios.post(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
        url: ''
    }).catch((error) => {
        return (error)
    });
}

const sendTGMessage = ({id, message}) => {
    return axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: id,
        text: message
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

const addTGUpdates = (result) => {
    try {
        if (result && result.update_id) {
            console.log('result.update_id', result.update_id);
            if (result.message) {
                console.log('result.message', result.message);

                const user = updateUser({
                    userData: result.message.from,
                    message: result.message.text
                });
            } else if (result.callback_query) {
                //callback for login
                const callbackData = JSON.parse(result.callback_query.data);
                if (callbackData.command === 'login' && callbackData.isReadyToLogin) {
                    const user = updateUserLoginStatus({
                        userData: result.callback_query.from,
                        isReadyToLogin: true
                    });
                    console.log('result.callback_query', user)
                } else if (callbackData.command === 'login' && !callbackData.isReadyToLogin) {
                    const user = updateUserLoginStatus({
                        userData: result.callback_query.from,
                        isReadyToLogin: false
                    });
                    console.log('got user login status', user);
                }
            } else if (result.edited_message) {
                console.log('result.edited_message', result.edited_message);
                const user = updateUser({
                    userData: result.edited_message.from,
                    message: result.edited_message.text
                });

            }
        }
    } catch (error) {
        return error;
    }
    console.log('end addTGUpdates')
    return {message: 'ok'}
}

const sendTGLoginMessage = (username) => {
    if (!users[username]?.chat_id) {
        return false;
    }
    return false; //TODO remove
    return axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: users[username].chat_id,
        text: 'Do you want to login?',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'yes',
                        callback_data: JSON.stringify({
                            command: 'login',
                            isReadyToLogin: true
                        })
                    },
                    {
                        text: 'no',
                        callback_data: JSON.stringify({
                            command: 'login',
                            isReadyToLogin: false
                        })
                    }]
            ],
            one_time_keyboard: true
        }
    }).catch(error => error)
}

export {
    switchOnTGWebhook,
    switchOffTGWebhook,
    addTGUpdates,
    sendTGLoginMessage,
    getTGWebhookInfo,
    sendTGMessage
}