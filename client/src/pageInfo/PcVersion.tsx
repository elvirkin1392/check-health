import styled from "styled-components";

import HealthyDays from "./HealthyDays";
import Calendar from "./Calendar";
import Sidebar from "./Sidebar";
import Table from "./Table"

const PcVersion = ({data}: {data: any}) => {

  return (
    <Container>
      <div style={{flex: "auto"}}>
        <Calendar/>
        <Container>
          <HealthyDays info={data.ill_periods} />
          <Table/>
        </Container>
      </div>
      <Sidebar bio={data.bio}/>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  margin-top: 30px;
  flex-direction: row;
`;

export default PcVersion;