import {instance as axios} from "../axios";

export const waitLoginResponse = (callback: Function, data: object) => {
  let pollingCounter = 24; //times will be send requests ~2 min

  async function subscribe() {
    if (pollingCounter === 0) {
      return false;
    }

    let response = await axios.post('/api/auth', data);

    if (response.status == 502) {
      pollingCounter--;
      await subscribe();

    } else if (response.status != 200) {
      console.log('Error authorization', response.statusText);

      setTimeout(async () => {
        pollingCounter--;
        await subscribe()
      }, 5000)
    } else {
      let message = response.data;

      if (!message.accessToken) {
        setTimeout(async () => {
          pollingCounter--;
          await subscribe()
        }, 5000)
      }
      if (message.accessDenied) { //TODO if user doesn't want to login show message
        return false;
      }
      if (message.accessToken) {
        localStorage.setItem('accessToken', message.accessToken);
        localStorage.setItem('username', message.username);
        axios.interceptors.request.use(config => {
          config.headers.Authorization = message.accessToken ? `Bearer ${message.accessToken}` : '';
          return config;
        });

        return true;
      }
    }
  }

  subscribe().then(res => callback(res));
}