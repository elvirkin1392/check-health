import {infoData} from "./mock"; //TODO replace with data from db
import {SContainer} from './styled/main'
import {STable, SDescription} from "./styled/Table";

const Table = () => {
  return (
    <SContainer $minHeight='500px' $width='100%'>
      <STable>
        <tbody>
        {infoData.map((item, index) =>
          <tr key={index}>
            <td>
              <SDescription>{item.lastDate}</SDescription>
              {item.name}
            </td>
            <td className={item.normal.from < item.result && item.normal.to > item.result ? 'good' : 'bad'} >
              <SDescription/>
              {item.result}
            </td>
            <td className={item.normal.from < item.result && item.normal.to > item.result ? 'good' : 'bad'} >
              <SDescription>prev</SDescription>
              {item.prevResult}</td>
          </tr>)}
        </tbody>
      </STable>
    </SContainer>
  );
};


export default Table;