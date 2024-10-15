import {SContainer, STitle} from './styled/main'
import {SAvatar, SName, SUsername} from "./styled/Sidebar";
import {Button} from "../components/Button";

const user = {
  name: 'Elvira',
  lastName: 'Salakhova',
  username: 'mrshomesoul'
}
const Sidebar = () => {
  return (
    <SContainer $width='400px' $height='calc(100vh - 100px)' $minHeight='500px'>
      <STitle>check-health</STitle>

      <SAvatar/>
      <SName>{user.name} {user.lastName}</SName>
      <SUsername>@{user.username}</SUsername>

      <Button $type='active'>Info</Button>
      <Button>Test results</Button>


    </SContainer>
  );
};


export default Sidebar;