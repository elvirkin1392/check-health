import {useEffect, useState} from "react";
import styled from "styled-components";

import HealthyDays from "./HealthyDays";
import Calendar from "./Calendar";
import Sidebar from "./Sidebar";
import Table from "./Table"
import {instance as axios} from "../axios";

type UserData = {
  bio: {};
  ill_periods: [];
};

localStorage.setItem('username', 'ivanova_eva') //todo for testing
const username = localStorage.getItem('username');

const PageInfo = () => {
  const [data, setData] = useState<UserData>({bio: {}, ill_periods: []});

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await axios.get('api/profile', {params: {username}});

      setData(result.data);
    }

    fetchProfile().catch(console.error);

  }, [])

  return (
    <Container>
      <div style={{flex: "auto"}}>
        <Calendar/>
        <Container>
          <HealthyDays info={data.ill_periods}/>
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
`;
export default PageInfo;