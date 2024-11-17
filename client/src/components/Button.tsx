import styled from 'styled-components';

export const Button = styled.button<{ $type?: string; }>`
  border-radius: 20px;
  box-shadow: ${props => props.$type === 'active'
          ?  ''
          : '1px 1px 1px 1px #847cb840, -2px -2px #fff' };
  background-color: #ECEFFD;
  color: #6b6b6b;
  
  padding: 15px;
  width: 220px;
  
  &:hover {
    cursor: pointer;
  }
  
  &:active {
    box-shadow: none;
  }
`;