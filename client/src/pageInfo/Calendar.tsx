import {getCalendar} from "./utils";
import {Days, Title} from './styled/main';
import {Container} from "../components/main";

const currentDate = new Date();
const currentMonth = currentDate.toLocaleString('default', {month: 'long'}).toLowerCase();

const Calendar = () => {
  const showAmountOfDays = 30;
  const range = getCalendar(showAmountOfDays);

  return (
    <Container $height='140px' >
      <Title>{currentMonth}</Title>

      <Days>
        {range.map((item, index) =>
          <div key={index}>
            <div className={currentDate.getDate() === item ? 'current' : ''}>{item}</div>
            <div className={index < showAmountOfDays/2 ? 'past' : ''}/>
          </div>
        )}
      </Days>

    </Container>
  );
};


export default Calendar;