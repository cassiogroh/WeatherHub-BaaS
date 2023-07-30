import React, {
  InputHTMLAttributes,
  useRef
} from 'react';

import { Container } from './styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  propName: string;
  handleInputCheck(value: boolean | undefined, name: string): void;
  checked?: boolean;
  disabled?: boolean;
}

const InputOption: React.FC<InputProps> = ({ name, propName, handleInputCheck, checked = false, disabled = false}) => {
  const inputRef =  useRef<HTMLInputElement>(null);

  return (
    <Container disabled={disabled}>
      <input
        disabled={disabled}
        type='checkbox'
        ref={inputRef}
        onClick={() => handleInputCheck(inputRef.current?.checked, propName)}
        defaultChecked={checked}
      />
      <p>{name}</p>
    </Container>
  )
}

export default InputOption
