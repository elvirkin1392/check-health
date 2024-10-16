import styled from "styled-components";
import {useState} from "react";

export const Switch = ({callback}) => {
  const [isOn, onSwitch] = useState(true);

  const handleSwitch = () => {
    callback();
    onSwitch(!isOn);
  }

  return (
    <SSwitch>
      <div
        className={`button ${isOn ? 'on' : 'off'}`}
        onClick={handleSwitch}/>
    </SSwitch>
  );
};

const SSwitch = styled.div`
  background-color: #ECEFFD;
  border-radius: 40px;
  box-shadow: 2px 2px 4px 0 #847cb840,
    -2px -2px 2px 0 #fff,
  inset 2px 2px 4px 0 #847cb840,
    inset -2px -2px 2px 0 #fff;

  margin-bottom: 10px;
  position: relative;

  height: 50px;
  width: 100px;

  & .button {
    position: absolute;
    right: 50px;
    width: 40px;
    height: 40px;
    background-color: #849A22;
    border-radius: 50%;
    margin-top: 5px;
    margin-left: 5px;
    box-shadow: 2px 2px 4px 0 #847cb840,
      -2px -2px 2px 0 #fff;
    transition: right 0.2s ease-out, background-color 0.2s;
  }

  & .off {
    background-color: #CB225F;
    left: auto;
    right: 5px;
  }

  & .button:hover {
    cursor: pointer;
  }
`;
