import type { ReactNode } from "react";
import "./Form.css";

// TODO: handle error
const Form = ({
  className = "",
  onSubmit,
  children,
}: {
  className?: string;
  onSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) => {
  return (
    <form className={`general-form ${className}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

export default Form;
