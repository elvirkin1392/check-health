import {Container, Title} from './styled/index'
import styled from "styled-components";

const HealthyDays = () => {
  return (
    <Wrap>
      <Container $width='200px' $height='200px'>
        <Title>healthy</Title>
        <Number>63</Number>
      </Container>
      <Switch/>
    </Wrap>

  );
};

const Number = styled.div`
  color: #849A22;
  font-size: 72px;
  padding-top: 20px;
`;

const Switch = styled.div`
  background-color: #ECEFFD;
  border-radius: 40px;
  box-shadow: 2px 2px 4px 0 #847cb840,
    -2px -2px 2px 0 #fff,
  inset 2px 2px 4px 0 #847cb840,
    inset -2px -2px 2px 0 #fff;

  height: 50px;
  width: 100px;

  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 40px;
    background-color: #849A22;
    border-radius: 50%;
    margin-top: 5px;
    margin-left: 5px;
    box-shadow: 2px 2px 4px 0 #847cb840,
      -2px -2px 2px 0 #fff;
  }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default HealthyDays;