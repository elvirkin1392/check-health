import getCalendar from "./getCalendar";
import {SContainer, STitle} from './styled/main'
import styled from "styled-components";


const date = new Date();
const currentMonth = date.toLocaleString('default', {month: 'long'}).toLowerCase();

const Calendar = () => {

  const range = getCalendar();
  return (
    <SContainer $height='140px'>
      <STitle>{currentMonth}</STitle>

      <Days>
        {range.map((item, index) =>
          <div key={index}>
            <div className={date.getDate() === item ? 'current' : ''}>{item}</div>
            <div className={index < 15 ? 'check' : ''}/>
          </div>
        )}
      </Days>

    </SContainer>
  );
};

const Days = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 20px;
  color: #999999;


  & div {
    min-width: 80px;
    text-align: center;

    &.current {
      color: #CB225F;
    }
    
    &.check {
      min-width: 14px;
      height: 14px;
      background-color: rgb(132, 154, 34, 50);
      box-shadow: inset 2px 2px 1px 0 #727272bf, inset -2px -2px 1px 0 #ffffff30;
      border-radius: 7px;
      width: 14px;
      margin: auto;
      margin-top: 10px;
    }

  }
`;
export default Calendar;