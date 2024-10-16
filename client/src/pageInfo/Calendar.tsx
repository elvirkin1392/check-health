import {getCalendar} from "./utils";
import {SDays} from "./styled/Calendar";
import {SContainer, STitle} from './styled/main'

const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', {month: 'long'}).toLowerCase();

const Calendar = () => {
  const showAmountOfDays = 30;
  const range = getCalendar(showAmountOfDays);

  return (
    <SContainer $height='140px'>
      <STitle>{currentMonth}</STitle>

      <SDays>
        {range.map((item, index) =>
          <div key={index}>
            <div className={currentDate.getDate() === item ? 'current' : ''}>{item}</div>
            <div className={index < showAmountOfDays/2 ? 'past' : ''}/>
          </div>
        )}
      </SDays>

    </SContainer>
  );
};


export default Calendar;