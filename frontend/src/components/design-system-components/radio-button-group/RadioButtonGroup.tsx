import "./RadioButtonGroup.css";

interface RadioButtonItem {
  value: string;
  text: string;
}

const RadioButton = ({
  name,
  value,
  text,
  defaultChecked = false,
  onChange,
}: RadioButtonItem & {
  name: string;
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
        defaultChecked={defaultChecked}
      />
      <span>{text}</span>
    </label>
  );
};

const RadioButtonGroup = ({
  legendText,
  buttonName,
  radioButtonItems,
  defaultValue,
  onChange,
}: {
  legendText: string;
  buttonName: string;
  radioButtonItems: RadioButtonItem[];
  defaultValue?: string;
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
          text={item.text}
          name={buttonName}
          defaultChecked={defaultValue === item.value}
        />
      ))}
    </fieldset>
  );
};

export default RadioButtonGroup;
