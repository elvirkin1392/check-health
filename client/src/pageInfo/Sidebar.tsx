import {SContainer, STitle} from './styled/main'
import {SAvatar, SName, SUsername} from "./styled/Sidebar";
import {Button} from "../components/Button";

const defaultValue = {first_name: '', second_name: '', username: ''};
const Sidebar = ({bio = defaultValue}) => {
  return (
    <SContainer $width='400px' $height='calc(100vh - 100px)' $minHeight='500px'>
      <STitle>check-health</STitle>

      <SAvatar/>
      <SName>{bio?.first_name} {bio?.second_name}</SName>
      <SUsername>@{bio?.username}</SUsername>

      <Button $type='active'>Info</Button>
      <Button>Test results</Button>


    </SContainer>
  );
};


export default Sidebar;