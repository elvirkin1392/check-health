import styled from 'styled-components'
import {useState} from "react";
import {Button, Input} from '../components';
import {waitLoginResponse} from "./api";

//TODO replace onatuhorize with state managment
const PageAuth = ({onAuthorize}: { onAuthorize: Function; }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    waitLoginResponse(onAuthorize, {username})
  }

  return (
    <Container>
      <div style={{color: '#6b6b6b'}}>check-health</div>
      <div className='prefix'>
        <Input type="text"
               className='input'
               placeholder='username'
               value={username}
               onChange={(event) => setUsername(event.target.value)}/>
      </div>
      <Button onClick={handleLogin}>Login</Button>
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

  & .prefix {
    position: relative;
  }

  & .input {
    padding-left: 30px;
  }

  & .prefix:before {
    content: '@';
    color: #c3c3c3;
    position: absolute;
    top: 5px;
    left: 5px;
    width: 10px;
    height: 10px;
    display: block;
    margin: 8px;
    z-index: 1;
  }
`

export default PageAuth;