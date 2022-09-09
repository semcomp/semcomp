import { ChangeEvent } from "react";

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
  Password = "password",
  File = "file",
}

function TextInput({
  onChange,
  value,
  type,
  start,
  end,
}: {
  onChange: any;
  value: string;
  type: InputType;
  start?: any;
  end?: any;
}) {
  return (
    <MaterialInput
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
  return <MaterialInput type="file" onChange={onChange} value={value} inputProps={{accept:".pdf"}} />;
}

function Input({
  label,
  onChange,
  value,
  type,
  choices,
  start,
  end,
  className,
}: {
  label?: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string | boolean;
  type: InputType;
  choices?: string[];
  start?: any;
  end?: any;
  className?: string;
}) {
  let input = (
    <TextInput
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
