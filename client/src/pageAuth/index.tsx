import {useState} from "react";

import {loginRequest, codeVerification} from "./api";
import {Button, Input} from '../components/main';
import {SContainer} from './styled';

//TODO replace onatuhorize with state managment
const PageAuth = ({onAuthorize}: { onAuthorize: Function; }) => {
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = async () => {
    const response = await loginRequest({username});
    setShowCodeVerification(response.isCodeSent);
  }
  const handleVerify = async () => {
    const response = await codeVerification({username, code});
    onAuthorize(response.isCodeVerified);
  }

  const Verify = <>
    <div className='wrap'>
      <label>Code was sent to @{username}</label>
      <Input type="text"
             className='input'
             placeholder='code'
             value={code}
             onChange={(event) => setCode(event.target.value)}/>
    </div>
    <Button onClick={handleVerify}>Verify</Button>
  </>;

  const Login = <>
    <div className='prefix'>
      <Input type="text"
             className='input'
             placeholder='username'
             value={username}
             onChange={(event) => setUsername(event.target.value)}/>
    </div>
    <Button onClick={handleLogin}>Login</Button>
  </>;

  return (
    <SContainer>
      <div style={{color: '#6b6b6b'}}>check-health</div>
      {showCodeVerification ? Verify : Login}
    </SContainer>
  );
};

export default PageAuth;