import Button from "./styles";

interface LinkProps {
  onClick: () => void;
  children: React.ReactNode;
}

const ButtonLink = ({ onClick, children }: LinkProps) => {
  return <Button onClick={onClick}>{children}</Button>;
};

export default ButtonLink;
