import {Title, Username} from './styled/main';
import {Avatar, Button, Container} from "../components/main";
import {Bio} from "./types";
import {useLang} from "../i18n/currentLang";

const defaultValue = {
  first_name: '',
  second_name: '',
  username: ''
};

const Sidebar = ({bio = defaultValue}: { bio: Bio}) => {
  const {t} = useLang();

  return (
    <Container $width='400px' $height='calc(100vh - 100px)' $minHeight='500px'>
      <Title>check-health</Title>
      <Avatar/>
      <div>{bio.first_name} {bio.second_name}</div>
      <Username>@{bio.username}</Username>
      <Button $type='active'>{t('nav_info')}</Button>
      <Button>{t('nav_test_results')}</Button>
    </Container>
  );
};

export default Sidebar;