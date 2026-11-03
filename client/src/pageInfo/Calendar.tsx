import {getCalendar} from "./utils";
import {Days, Title} from './styled/main';
import {Container} from "../components/main";
import {useLang} from "../i18n/currentLang";

const Calendar = () => {
  const {lang} = useLang();
  const showAmountOfDays = 30;
  const range = getCalendar(showAmountOfDays);

  // Месяц — в языке интерфейса, а не в локали устройства (FR-6). Считается
  // при отрисовке: вкладка, открытая через полночь, не показывает вчерашний день.
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString(lang, {month: 'long'}).toLowerCase();

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