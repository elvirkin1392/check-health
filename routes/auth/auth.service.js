import generateToken from './token.utils.js'
import HttpException from '../../models/http-exception.model.js'
import {users} from '../../mock.js'
import {sendTGLoginMessage} from '../../telegramBot/telegram.service.js'

const createUser = (userData) => {
    users[userData.username] = userData;
    return users[userData.chat_id];
}

const getCurrentUser = () => {
}


const login = async (username) => {
    if (!username) {
        throw new HttpException(422, "username can't be blank");
    }
    if (!users[username]) {
        throw new HttpException(422, "no user found");
    }
    //TODO if there is no username, when should we create a user?

    if (users[username]?.authorization.status === 'ready') {

        const user = users[username];
        let result = null;

        if (users[username]?.authorization.isAuthenticated) {
            result = {
                username: user.username,
                bio: user.bio,
                image: user.image,
                accessToken: generateToken(user.chat_id),
            }
            //close login session
            users[username].authorization = {
                status: null, //ready, pending, null
                isAuthenticated: false
            }
        }
        return result;
    }

    if (users[username].authorization.status !== 'pending') {
        try {
            const result = await sendTGLoginMessage(username);
            // login session start
            users[username].authorization = {
                status: 'pending', //ready, pending, null
                isAuthenticated: false
            }

            console.log('Do you want to login?', result.data);
        } catch (error) {
            console.log('Error response TG', error);
        }
    }

    return {result: 'pending'};
}
const updateUser = ({userData, message}) => {
}
const updateUserLoginStatus = ({userData, isReadyToLogin}) => {
    users[userData.username] = {
        ...users[userData.username],
        ...userData,
        authorization: {
            status: 'ready', //close login session
            isAuthenticated: isReadyToLogin
        }
    };

    return users[userData.username];
}

export {updateUser, login, getCurrentUser, createUser, updateUserLoginStatus}