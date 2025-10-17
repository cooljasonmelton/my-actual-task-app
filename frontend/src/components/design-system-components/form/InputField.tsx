import { forwardRef } from "react";

import "./InputField.css";

type InputFieldProps = {
  id: string;
  className?: string;
  label: string;
  type: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

// TODO: handle error
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      className = "",
      label,
      type,
      name,
      placeholder,
      required = false,
      value = "",
      onChange,
      disabled = false,
    },
    ref
  ) => {
    return (
      <>
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          ref={ref}
          className={`input-field-input ${className}`}
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          value={value}
          disabled={disabled}
        />
      </>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
