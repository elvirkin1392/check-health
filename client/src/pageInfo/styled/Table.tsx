import styled from "styled-components";

export const STable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  & td {
    border-bottom: 1px solid #CCCCCC;
    padding: 10px 20px 20px ;
  }

  @media (max-width: 700px) {
    & tr:last-child {
      & td {
        border-bottom: none;
      }
    }
  }
  
  & .good {
    color: #849A22;
  }
  & .bad {
    color: #EF1C8E;
  }

`;

export const SDescription = styled.div`
  height: 14px;
  color: #999999;
  font-size: 14px;
  letter-spacing: normal;
  margin-bottom: 10px;
`