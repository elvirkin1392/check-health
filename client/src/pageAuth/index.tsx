import {useState} from "react";

import {loginRequest, codeVerification} from "./api";
import {Button, Input} from '../components/main';
import {Container} from './styled';
import {useLang} from '../i18n/currentLang';

const PageAuth = ({onAuthorize}: { onAuthorize: (value: boolean) => void; }) => {
  const {t} = useLang();
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = async () => {
    const response = await loginRequest({username});
    if (response.url) {
      window.open(response.url)
    }
    setShowCodeVerification(response.isCodeSent);
  }
  const handleVerify = async () => {
    const response = await codeVerification({username, code});
    onAuthorize(response.isCodeVerified);
  }

  const Verify = <>
    <div className='wrap'>
      <label>{t('code_sent', {username})}</label>
      <Input type="text"
             className='input'
             placeholder={t('code')}
             value={code}
             onChange={(event) => setCode(event.target.value)}/>
    </div>
    <Button onClick={handleVerify}>{t('verify')}</Button>
  </>;

  const Login = <>
    <div className='prefix'>
      <Input type="text"
             className='input'
             placeholder={t('username')}
             value={username}
             onChange={(event) => setUsername(event.target.value)}/>
    </div>
    <Button onClick={handleLogin}>{t('login')}</Button>
  </>;

  return (
    <Container>
      <div style={{color: '#6b6b6b'}}>check-health</div>
      {showCodeVerification ? Verify : Login}
    </Container>
  );
};

export default PageAuth;