import {infoData} from "./mock"; //TODO replace with data from db
import {STable, SDescription} from "./styled/Table";
import {Container} from "../components/main";
import {useLang} from "../i18n/currentLang";
import {analyteLabel} from "../i18n/analytes";
import {formatAnalyteDate} from "./formatDate";

const Table = () => {
  const {lang, t} = useLang();

  return (
    <Container $minHeight='500px' $width='100%' >
      <STable>
        <tbody>
        {infoData.map((item, index) => {
          const descDate = formatAnalyteDate(item.lastDate, lang);

          return <tr key={index}>
            <td>
              <SDescription>{descDate}</SDescription>
              {analyteLabel(item, lang)}
            </td>
            <td
              className={item.normal.from < Number(item.result) && item.normal.to > Number(item.result) ? 'good' : 'bad'}>
              <SDescription/>
              {item.result}
            </td>
            <td
              className={item.normal.from < Number(item.result) && item.normal.to > Number(item.result) ? 'good' : 'bad'}>
              <SDescription>{t('previous')}</SDescription>
              {item.prevResult}</td>
          </tr>
        })}
        </tbody>
      </STable>
    </Container>
  );
};


export default Table;