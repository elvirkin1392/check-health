import styled from 'styled-components';

const Header = () => {
  return (
    <Container>
      <RightSide>
        <Logo/>
        <Title>check-health</Title>
      </RightSide>

      <Username>Elvira S</Username>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 50px;
  width: 100%;
  background: #ECECEC;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  align-items: center;
`
const RightSide = styled.div`
  display: flex;
  justify-content: space-between;
  width: 300px;
`
const Username = styled.div`
  color: #000;
  font-family: monospace;
  font-size: 16px;
  margin-right: 30px;
`
const Title = styled.div`
  color: #000;
  font-family: monospace;
  font-size: 16px;
`
const Logo = styled.div`
  width: 25px;
  height: 25px;
  background-color: #fff;
  border-radius: 50%;
  margin-left: 30px;
`
export default Header;