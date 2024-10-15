import {SContainer, STitle} from './styled/main'
import styled from "styled-components";
import Switch from '../components/Switch'

const healthy = 302;
const sick = 63;
const HealthyDays = () => {
  return (
    <Wrap>
      <SContainer $width='200px' $height='200px'>
        <STitle>healthy</STitle>
        <Number>63</Number>
      </SContainer>
      <Switch/>
      <Summary>
        <span style={{color: '#849A2250'}}>{healthy}</span>|
        <span style={{color: '#CB225F50'}}>{sick}</span>
      </Summary>
    </Wrap>

  );
};

const Summary = styled.div`
  font-size: 34px;
  color: #ffffff20;
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