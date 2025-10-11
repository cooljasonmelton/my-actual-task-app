import type { DragEvent, ReactNode } from "react";
import "./RadioButtonGroup.css";

interface RadioButtonItem {
  value: string;
  cta: string | ReactNode;
  className?: string;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDragEnter?: (event: DragEvent<HTMLElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

const RadioButton = ({
  name,
  value,
  cta,
  checked,
  defaultChecked = false,
  onChange,
  className,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: RadioButtonItem & {
  name: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const labelClassName = className
    ? `radio-btn ${className}`
    : "radio-btn";

  return (
    <label
      className={labelClassName}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        onChange={onChange}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
      />
      {cta}
    </label>
  );
};

const RadioButtonGroup = ({
  legendText,
  buttonName,
  radioButtonItems,
  defaultValue,
  value,
  onChange,
}: {
  legendText: string;
  buttonName: string;
  radioButtonItems: RadioButtonItem[];
  defaultValue?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const buttonItems = radioButtonItems || [];
  return (
    <fieldset className="radio-button-group">
      <legend className="sr-only">{legendText}</legend>

      {buttonItems.map((item, key) => (
        <RadioButton
          onChange={onChange}
          key={key + item.value}
          value={item.value}
          cta={item.cta}
          name={buttonName}
          checked={value === item.value}
          defaultChecked={defaultValue === item.value}
          className={item.className}
          onDragOver={item.onDragOver}
          onDragEnter={item.onDragEnter}
          onDragLeave={item.onDragLeave}
          onDrop={item.onDrop}
        />
      ))}
    </fieldset>
  );
};

export default RadioButtonGroup;
