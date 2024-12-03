import {Title, Username} from './styled/main';
import {Avatar, Button, Container} from "../components/main";

type Bio = {
  first_name: String;
  second_name: String;
  username: String
};

const defaultValue = {
  first_name: '',
  second_name: '',
  username: ''
};

const Sidebar = ({bio = defaultValue}: { bio: Bio}) => {
  return (
    <Container $width='400px' $height='calc(100vh - 100px)' $minHeight='500px'>
      <Title>check-health</Title>
      <Avatar/>
      <div>{bio.first_name} {bio.second_name}</div>
      <Username>@{bio.username}</Username>
      <Button $type='active'>Info</Button>
      <Button>Test results</Button>
    </Container>
  );
};

export default Sidebar;