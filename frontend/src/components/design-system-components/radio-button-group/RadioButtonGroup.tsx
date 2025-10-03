import type { ReactNode } from "react";
import "./RadioButtonGroup.css";

interface RadioButtonItem {
  value: string;
  cta: string | ReactNode;
}

const RadioButton = ({
  name,
  value,
  cta,
  checked,
  defaultChecked = false,
  onChange,
}: RadioButtonItem & {
  name: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label className="radio-btn">
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
        />
      ))}
    </fieldset>
  );
};

export default RadioButtonGroup;
