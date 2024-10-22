import styled from "styled-components";

export const SContainer = styled.div`
  display: flex;
  margin: 0;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;

  & * {
    margin-bottom: 10px;
  }

  & .prefix {
    position: relative;
  }

  & .input {
    padding-left: 30px;
  }

  & .prefix:before {
    content: '@';
    color: #c3c3c3;
    position: absolute;
    top: 5px;
    left: 5px;
    width: 10px;
    height: 10px;
    display: block;
    margin: 8px;
    z-index: 1;
  }

  & .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  & label {
    font-size: 14px;
    color: #c3c3c3;
  }
`;