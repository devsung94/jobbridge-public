import React from "react";
import DatePicker from "@/components/ui/DatePickerInput";

type CommonProps = {
  label: string;
  id: string;
  name: string;
  required?: boolean;
  value?: string;
  placeholder?: string;
  onKeyDown?: React.KeyboardEventHandler<any>;
  className?: string;
};

type LabeledFieldProps =
  | (CommonProps & {
      type?: "text" | "email" | "number" | "date" | "password";
      as?: "input";
      inputRef?: React.RefObject<HTMLInputElement | null>;
      readOnly?: boolean;
      onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    })
  | (CommonProps & {
      as: "textarea";
      textareaRef?: React.RefObject<HTMLTextAreaElement>;
      readOnly?: boolean;
      onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
      rows?: number;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    })
  | (CommonProps & {
      as: "datepicker";
      onChange: (val: string) => void;
    });

const LabeledField: React.FC<LabeledFieldProps> = (props) => {
  const {
    label,
    id,
    name,
    required,
    value,
    placeholder,
    onKeyDown,
    className = "",
  } = props;

  const baseClass =
    "w-full p-3 border border-gray-300 rounded-lg text-gray-800 rounded-md bg-white focus:border-blue-500 focus:outline-none" + className;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {props.as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={props.onChange}
          onClick={props.onClick}
          readOnly={props.readOnly}
          onKeyDown={props.onKeyDown}
          rows={props.rows}
          ref={props.textareaRef}
          className={baseClass}
        />
      ) : props.as === "datepicker" ? (
        <DatePicker
          value={value || ""}
          onChange={props.onChange}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={props.type || "text"}
          required={required}
          value={value}
          placeholder={placeholder}
          onChange={props.onChange}
          onClick={props.onClick}
          onKeyDown={onKeyDown}
          readOnly={props.readOnly}
          ref={props.inputRef}
          className={baseClass}
        />
      )}
    </div>
  );
};

export default LabeledField;
