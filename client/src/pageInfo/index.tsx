import styled from "styled-components";

import HealthyDays from "./HealthyDays";
import Calendar from "./Calendar";
import Sidebar from "./Sidebar";
import Table from "./Table"


const PageInfo = () => {
  return (
    <Container>
      <div style={{flex: "auto"}}>
        <Calendar/>
        <Container>
          <HealthyDays/>
          <Table/>
        </Container>
      </div>
      <Sidebar/>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
`;
export default PageInfo;