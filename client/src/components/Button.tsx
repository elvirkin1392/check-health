import styled from 'styled-components';

export const Button = styled.button`
  border-radius: 20px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2),
    -2px -2px #fff;
  background-color: #f0f1f3;
  height: 50px;
  width: 160px;
  color: #6b6b6b;
  
  &:hover {
    cursor: pointer;
  }
  
  &:active {
    box-shadow: none;
  }
`