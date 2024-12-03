import {Container} from "../components/main";
import HealthyDays from "./HealthyDays";
import Table from "./Table";

const MobileVersion = ({data}: {data: any}) => {
  const {
    bio = {
      first_name: '',
      second_name: '',
      username: ''
    }
  } = data;
  return (
    <div>
      <Container $mobileHide>
        <div style={{letterSpacing: '2px', color: '#000'}}>check-health</div>
        <div style={{paddingTop: '15px', color: '#999999'}}>{bio.first_name} {bio.second_name}</div>
        <div style={{fontSize: '14px', color: '#999999'}}>@{bio.username}</div>
      </Container>

      <HealthyDays info={data.ill_periods} isMobile/>
      <Table/>
    </div>
  );
};

export default MobileVersion;