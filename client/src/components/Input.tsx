import styled from "styled-components";

export const Input = styled.input`
  box-shadow: inset 2px 2px 2px 1px rgba(0, 0, 0, 0.2), inset -2px -2px #fff;
  border-radius: 20px;

  background-color: #f0f1f3;
  height: 50px;
  width: 280px;
  padding: 10px;
  color: #6b6b6b;

  &::placeholder {
    color: #c3c3c3;
  }
  &:focus-visible {
    outline: none;
  }
`