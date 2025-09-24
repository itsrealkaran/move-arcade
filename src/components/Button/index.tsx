import React from "react";
import { ButtonContainer } from "./styles";

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

const Button = ({ children, onClick }: ButtonProps) => {
  return <ButtonContainer onClick={onClick}>{children}</ButtonContainer>;
};

export default Button;
