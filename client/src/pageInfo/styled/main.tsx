import styled from "styled-components";

export const Title = styled.span`
  color: #999999;
  letter-spacing: 2px;
`;

export const Username = styled.div`
  font-size: 14px;
  color: #999999;
`;

export const Days = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 20px;
  color: #999999;
  
  & div {
    min-width: 80px;
    text-align: center;

    &.current {
      color: #CB225F;
    }
    
    &.past {
      min-width: 14px;
      height: 14px;
      background-color: rgb(132, 154, 34, 50);
      box-shadow: inset 2px 2px 1px 0 #727272bf, inset -2px -2px 1px 0 #ffffff30;
      border-radius: 7px;
      width: 14px;
      margin: auto;
      margin-top: 10px;
    }

  }
`;