import { type ReactNode } from "react";
import "./Button.css";

interface ButtonProps {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "dark" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  className?: string;
  form?: string;
}

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  type = "button",
  className = "",
  isLoading = false,
  ...props
}: ButtonProps) => {
  const baseClass = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const disabledClass = disabled ? "btn--disabled" : "";
  const isLoadingClass = isLoading ? "btn--loading" : "";

  const buttonClass = [
    baseClass,
    variantClass,
    sizeClass,
    disabledClass,
    isLoadingClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
