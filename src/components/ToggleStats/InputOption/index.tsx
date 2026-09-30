import { InputHTMLAttributes } from "react";

import { Container } from "./styles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  propName: string;
  handleInputCheck(value: boolean | undefined, name: string): void;
  checked?: boolean;
  disabled?: boolean;
}

const InputOption = ({ name, propName, handleInputCheck, checked = false, disabled = false }: InputProps) => {
  return (
    <Container disabled={disabled}>
      <input
        disabled={disabled}
        type='checkbox'
        onChange={event => handleInputCheck(event.target.checked, propName)}
        checked={checked}
      />
      <p>{name}</p>
    </Container>
  );
};

export default InputOption;
