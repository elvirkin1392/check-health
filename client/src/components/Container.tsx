import styled from "styled-components";

export const Container = styled.div<{
  $height?: string;
  $minHeight?: string;
  $width?: string;
  $mobileHide?: boolean
}>`
  background-color: #ECEFFD;
  border-radius: 20px;
  box-sizing: border-box;
  box-shadow: 2px 2px 4px 0 #847cb840, -2px -2px 2px 0 #fff;

  text-align: center;

  position: relative;
  overflow: hidden;

  padding: 20px;
  margin: 0 10px 20px 10px;

  height: ${props => props.$height || "auto"};
  min-height: ${props => props.$minHeight || "auto"};
  width: ${props => props.$width || "auto"};

  @media (max-width: 700px) {
    height: fit-content;
    min-height: unset;
    width: auto;
  }
  
  ${(props) => {
    return props.$mobileHide ? `
      @media (max-width: 600px) {
        background-color: transparent;
        border: none;
        box-shadow: none;
        width: unset;
      }
    ` : ''
  }}
`;
