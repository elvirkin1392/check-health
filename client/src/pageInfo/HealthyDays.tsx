import styled from "styled-components";

import Switch from '../components/Switch'
import {SContainer, STitle} from './styled/main'
import {getAmountHealthyDays, getSickDaysLastYear} from "./utils";

const HealthyDays = ({info}) => {
  const sickDays = getSickDaysLastYear(info);
  const healthyDays = getAmountHealthyDays(info);

  return (
    <Wrap>
      <SContainer $width='200px' $height='200px'>
        <STitle>healthy</STitle>
        <Number>{healthyDays}</Number>
      </SContainer>
      <Switch/>
      <Summary>
        <span style={{color: '#849A2250'}}>{365 - sickDays}</span>|
        <span style={{color: '#CB225F50'}}>{sickDays}</span>
      </Summary>
    </Wrap>
  );
};

const Summary = styled.div`
  font-size: 34px;
  color: #ffffff40;
`

const Number = styled.div`
  color: #849A22;
  font-size: 72px;
  padding-top: 20px;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default HealthyDays;