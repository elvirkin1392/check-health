const CHAT_ID = process.env.CHECK_HEALTH_CHAT_ID;

const users = {
    mrshomesoul: {
        chat_id: CHAT_ID,
        messages: [], //do we need to keep them?
        files: '',
        info: {},
        authorization: {
            status: null, //ready, pending, null
            isAuthenticated: false
        }
    }
}
export {users};