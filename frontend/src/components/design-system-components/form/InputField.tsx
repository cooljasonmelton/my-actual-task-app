import "./InputField.css";

// TODO: handle error
const InputField = ({
  id,
  className = "",
  label,
  type,
  name,
  placeholder,
  required = false,
  value = "",
  onChange,
}: {
  id: string;
  className?: string;
  label: string;
  type: string;
  name: string;
  placeholder: string;
  required?: boolean;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        className={`input-field-input ${className}`}
        id={id}
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        value={value}
      />
    </>
  );
};

export default InputField;
