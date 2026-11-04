import {STable, SDescription} from "./styled/Table";
import {Container} from "../components/main";
import {useLang} from "../i18n/currentLang";
import {analyteLabel} from "../i18n/analytes";
import {formatAnalyteDate} from "./formatDate";
import {AnalyteResult} from "../../../shared/analytes.tsx";
import {analyteKey, isWithinNormal, latestResults, previousResult} from "./analyteRow";

// `undefined` — «сравнить нельзя»: такую ячейку не красим ни в хорошее, ни в плохое.
const normalClass = (result: AnalyteResult): string | undefined => {
  const within = isWithinNormal(result);
  return within === undefined ? undefined : within ? 'good' : 'bad';
};

// Дата приходит строкой `YYYY-MM-DD`; `new Date(строка)` разобрал бы её как UTC
// и в часовых поясах западнее Гринвича сдвинул бы на день назад.
const toLocalDate = (date: string): Date => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Документы без анализов поля не имеют (§8), поэтому по умолчанию — пустая история.
const Table = ({results = []}: {results?: AnalyteResult[]}) => {
  const {lang, t} = useLang();

  return (
    <Container $minHeight='500px' $width='100%' >
      <STable>
        <tbody>
        {latestResults(results).map(item => {
          const prev = previousResult(results, item);

          return <tr key={analyteKey(item)}>
            <td>
              <SDescription>{formatAnalyteDate(toLocalDate(item.date), lang)}</SDescription>
              {analyteLabel(item, lang)}
            </td>
            <td className={normalClass(item)}>
              <SDescription/>
              {item.value}
            </td>
            <td className={prev && normalClass(prev)}>
              <SDescription>{t('previous')}</SDescription>
              {/* Прочерк, а не пустота: иначе не видно, что сравнивать не с чем. */}
              {prev ? prev.value : '—'}
            </td>
          </tr>
        })}
        </tbody>
      </STable>
    </Container>
  );
};


export default Table;
