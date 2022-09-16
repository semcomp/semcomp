import { ChangeEvent, ReactNode } from "react";

import {
  Checkbox,
  IconButton,
  Input as MaterialInput,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { Info } from "@mui/icons-material";

export enum InputType {
  Select = "select",
  Checkbox = "checkbox",
  Text = "text",
  Number = "number",
  Password = "password",
  File = "file",
}

function TextInput({
  tooltip,
  autofocus,
  onChange,
  value,
  type,
  start,
  end,
}: {
  tooltip: any,
  autofocus: boolean,
  onChange: any;
  value: string;
  type: InputType;
  start?: ReactNode;
  end?: ReactNode;
}) {
  let returnContent = tooltip ? (
    <>
      <Tooltip arrow placement="top-start" title={tooltip ? tooltip : ""} enterTouchDelay={1}>
        <Info sx={{ color: "#002776" }} />
      </Tooltip>
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
    </>
  ) :
    <MaterialInput
      autoFocus={autofocus}
      fullWidth
      onChange={onChange}
      value={value}
      type={type}
      className="my-3"
      startAdornment={start}
      endAdornment={end}
    />;

  return (
    returnContent
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
  tooltip,
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
  tooltip?: any,
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
      tooltip={tooltip}
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
    </div >
  );
}

export default Input;
