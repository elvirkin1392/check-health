import styled from 'styled-components'
import {useState} from "react";
import {instance as axios} from '../axios.tsx'

const PageAuth = ({onAuthorize} : { onAuthorize: Function; }) => {
  const [username, setUsername] = useState('');
  const handleLogin = () => {

    let pollingCounter = 150; //times will be send requests ~5 min
    async function subscribe() {
      if (pollingCounter === 0) {
        onAuthorize(false);
        return;
      }
      console.log('looong poling')
      let response = await axios.post('/api/auth',
        {
          username: username
        });

      if (response.status == 502) {
        pollingCounter--;
        await subscribe();
      } else if (response.status != 200) {
        console.log('Error authorization', response.statusText);
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollingCounter--;
        await subscribe();
      } else {
        // Получить сообщение
        let message = await response.data;

        if (!message.accessToken) {
          setTimeout(async () => {
            pollingCounter--;
            await subscribe()
          }, 2000)
        }
        if (message.accessToken) {
          localStorage.setItem('accessToken', message.accessToken);
          onAuthorize(true);
          axios.interceptors.request.use(config => {
            config.headers.Authorization = message.accessToken ? `Bearer ${message.accessToken}` : '';
            return config;
          });
          console.log('User authorized', message);
        }
      }
    }

    subscribe();

  }

  const handleTest = () => {
    axios.get('/api/test')
      .then(result => {
        console.log('test', result.data)
      })
      .catch(error => console.log('error test', error.message));
  }

  return (
    <Container>
      <div>check-health</div>
      <input type="text"
             placeholder='@username'
             onChange={(event) => setUsername(event.target.value)}/>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleTest}>Test</button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  margin: 0;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;

  & * {
    margin-bottom: 10px;
  }

  & input {
    background-color: #D9D9D9;
    height: 50px;
    width: 280px;
    padding: 10px;

    &::placeholder {
      color: white;
    }
  }

  & button {
    background-color: #D9D9D9;
    height: 50px;
    width: 160px;
  }
`
export default PageAuth;