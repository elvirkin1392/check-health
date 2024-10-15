import styled from "styled-components";

export const SContainer = styled.div`
  background-color: #ECEFFD;
  border-radius: 20px;
  box-sizing: border-box;
  box-shadow: 2px 2px 4px 0 #847cb840, -2px -2px 2px 0 #fff;

  text-align: center;
  
  position: relative;
  overflow: hidden;
  
  padding: 20px;
  margin: 0 10px 20px 10px ;
  
  height: ${props => props.$height || "auto"};
  min-height: ${props => props.$minHeight || "auto"};
  width: ${props => props.$width || "auto"};
`;

export const STitle = styled.span`
  color: #999999;
  letter-spacing: 2px;
`