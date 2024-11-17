import {countDaysFromLastPeriodTilNow, countSummaryFromDayPeriodsLastYear} from "./utils";
import {Switch, Container} from '../components/main';
import {SNumber, SSummary, SWrap} from "./styled/HealthyDays";

const HealthyDays = ({info, isMobile}: { info: any, isMobile?: boolean }) => {
    const sickDays = countSummaryFromDayPeriodsLastYear(info);
    const healthyDays = countDaysFromLastPeriodTilNow(info);

    const forMobile = <>
      <Container>
        <div style={{color: '#999', fontSize: '24px'}}>
          healthy
        </div>
        <div style={{color: '#849A22', fontSize: ' 96px', lineHeight: '122px'}}>
          {healthyDays}
        </div>
        <div style={{color: '#fff', fontSize: '46px'}}>
          <span style={{color: '#849A2250'}}>{365 - sickDays}</span>|
          <span style={{color: '#CB225F50'}}>{sickDays}</span>
        </div>
      </Container>
    </>;

    return isMobile
      ? forMobile
      : <SWrap>
        <Container $width='200px' $height='200px'>
          <div style={{color: '#999', letterSpacing: '2px'}}>healthy</div>
          <SNumber>{healthyDays}</SNumber>
        </Container>

        <Switch/>
        <SSummary>
          <span style={{color: '#849A2250'}}>{365 - sickDays}</span>|
          <span style={{color: '#CB225F50'}}>{sickDays}</span>
        </SSummary>

      </SWrap>
      ;
  }
;

export default HealthyDays;