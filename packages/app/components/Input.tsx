import { ChangeEvent, ReactNode } from "react";

import {
  Checkbox,
  Input as MaterialInput,
  MenuItem,
  Select,
} from "@mui/material";

export enum InputType {
  Select = "select",
  Checkbox = "checkbox",
  Text = "text",
  Number = "number",
  Password = "password",
  File = "file",
}

function TextInput({
  autofocus,
  onChange,
  value,
  type,
  start,
  end,
}: {
  autofocus: boolean,
  onChange: any;
  value: string;
  type: InputType;
  start?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <MaterialInput
      autoFocus={autofocus}
      fullWidth
      onChange={onChange}
      value={value}
      type={type}
      className="my-3"
      startAdornment={start}
      endAdornment={end}
    />
  );
}

function SelectInput({
  onChange,
  value,
  choices,
}: {
  onChange: any;
  value: string;
  choices: string[];
}) {
  return (
    <Select
      fullWidth
      onChange={onChange}
      value={value}
      variant="standard"
      className="my-3"
    >
      {choices.map((choice) => (
        <MenuItem key={choice} value={choice}>
          {choice}
        </MenuItem>
      ))}
    </Select>
  );
}

function CheckboxInput({ onChange, value }: { onChange: any; value: boolean }) {
  return <Checkbox onChange={onChange} checked={value} />;
}

function FileInput({ onChange, value }: { onChange: any; value: string }) {
  return <MaterialInput type="file" onChange={onChange} value={value} inputProps={{ accept: ".pdf" }} />;
}

function Input({
  autofocus,
  label,
  onChange,
  value,
  type,
  choices,
  start,
  end,
  className,
}: {
  autofocus?: boolean,
  label?: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number | boolean;
  type: InputType;
  choices?: string[];
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
}) {
  let input = (
    <TextInput
      autofocus={autofocus}
      onChange={onChange}
      value={value as string}
      type={type}
      start={start}
      end={end}
    />
  );

  if (type === InputType.Checkbox) {
    input = <CheckboxInput onChange={onChange} value={value as boolean} />;
  }

  if (type === InputType.Select) {
    input = (
      <SelectInput
        onChange={onChange}
        value={value as string}
        choices={choices}
      />
    );
  }

  if (type === InputType.File) {
    input = <FileInput onChange={onChange} value={value as string} />;
  }

  return (
    <div className={className}>
      <label>
        {type !== InputType.Checkbox && label}
        {input}
        {type === InputType.Checkbox && label}
      </label>
    </div>
  );
}

export default Input;
