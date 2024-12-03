import {infoData} from "./mock"; //TODO replace with data from db
import {STable, SDescription} from "./styled/Table";
import {Container} from "../components/main";

const Table = () => {
  return (
    <Container $minHeight='500px' $width='100%' >
      <STable>
        <tbody>
        {infoData.map((item, index) => {
          const descDate = item.lastDate.getDate()
            + ' '
            + item.lastDate.toLocaleString('en-US', {month: 'short'})
            + ' '
            + item.lastDate.getFullYear();

          return <tr key={index}>
            <td>
              <SDescription>{descDate}</SDescription>
              {item.name}
            </td>
            <td
              className={item.normal.from < Number(item.result) && item.normal.to > Number(item.result) ? 'good' : 'bad'}>
              <SDescription/>
              {item.result}
            </td>
            <td
              className={item.normal.from < Number(item.result) && item.normal.to > Number(item.result) ? 'good' : 'bad'}>
              <SDescription>prev</SDescription>
              {item.prevResult}</td>
          </tr>
        })}
        </tbody>
      </STable>
    </Container>
  );
};


export default Table;