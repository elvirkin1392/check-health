import {Switch} from '../components'
import {SContainer, STitle} from './styled/main'
import {SNumber, SSummary, SWrap} from "./styled/HealthyDays";
import {countDaysFromLastPeriodTilNow, countSummaryFromDayPeriodsLastYear} from "./utils";

const HealthyDays = ({info}) => {
  const sickDays = countSummaryFromDayPeriodsLastYear(info);
  const healthyDays = countDaysFromLastPeriodTilNow(info);

  return (
    <SWrap>
      <SContainer $width='200px' $height='200px'>
        <STitle>healthy</STitle>
        <SNumber>{healthyDays}</SNumber>
      </SContainer>
      <Switch/>
      <SSummary>
        <span style={{color: '#849A2250'}}>{365 - sickDays}</span>|
        <span style={{color: '#CB225F50'}}>{sickDays}</span>
      </SSummary>
    </SWrap>
  );
};

export default HealthyDays;