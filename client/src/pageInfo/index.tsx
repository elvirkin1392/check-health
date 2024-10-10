import axios from "axios";
import styled from "styled-components";
import getCalendar from './getCalendar.tsx';
import {infoData,  healthydays} from './mock.tsx';

const date = new Date();
const currentMonth = date.toLocaleString('default', {month: 'long'}).toLowerCase();

const range = getCalendar();
const handleTest = () => {
  axios.get('api/profile').then((response) => {
    console.log('response', response)
  })
}

const PageInfo = () => {
  return (
    <Container>
      <div className='month'>
        {currentMonth}
      </div>
      <Days>
        {range.map((item, index) =>
          <div key={index} className={date.getDate() === item ? 'current' : ''}>
            {item}
          </div>)}
      </Days>
      <Main>
        <div>
          <table>
            <tbody>
            {infoData.map((item, index) =>
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.result}</td>
              </tr>)}
            </tbody>
          </table>

          <button onClick={handleTest}>test</button>
        </div>
        <div className='rightSide'>
          this body <br/>
          has worked <br/>
          <Healtydays>{healthydays}</Healtydays> days <br/>
          without <br/>
          a lost time <br/>
          accidents
        </div>
      </Main>
    </Container>
  );
};

const Days = styled.div`
  display: flex;
  justify-content: center;
  overflow: hidden;
  width: 100vw;
  position: absolute;
  left: 0;

  & div {
    min-width: 80px;
    text-align: center;

    &.current {
      color: #CB225F;
    }
  }
`;
const Healtydays = styled.span`
  background-color: #D9D9D9;
  padding: 5px 15px;
`
const Main = styled.div`
  display: flex;
  justify-content: stretch;
  height: 80vh;

  & div {
    width: 100%;

    align-self: center;
    font-size: 48px;
    margin: 0 100px;
  }

  & .rightSide {
    font-family: monospace;
    text-align: end;
  }

  & table {
    font-family: monospace;
    font-size: 28px;
    font-weight: lighter;
  }

  & td {
    padding: 0 50px;
  }
`
const Container = styled.div`
  & .month {
    color: #999999;
    text-align: center;
    padding: 20px 0;
  }

`
export default PageInfo;