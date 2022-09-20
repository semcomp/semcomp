import { ReactNode } from "react";

import {
  Checkbox,
  FormControl,
  Input as MaterialInput,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

export enum InputType {
  Select = "select",
  Checkbox = "checkbox",
  Text = "text",
  Number = "number",
  Password = "password",
  File = "file",
  Date = "date",
}

function TextInput({
  label,
  onChange,
  value,
  type,
  start,
  end,
}: {
  label: string;
  onChange: any;
  value: string;
  type: InputType;
  start?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <TextField
      fullWidth
      onChange={onChange}
      value={value}
      type={type}
      label={label}
      variant="outlined"
      className="my-3 bg-white"
      InputProps={{
        startAdornment: start,
        endAdornment: end,
      }}
    />
  );
}

function SelectInput({
  label,
  onChange,
  value,
  choices,
}: {
  label: string;
  onChange: any;
  value: string;
  choices: string[];
}) {
  return (<FormControl className="my-3 bg-white" fullWidth>
    <InputLabel id="label">{label}</InputLabel>
    <Select
      onChange={onChange}
      value={value}
      label={label}
      labelId="label"
    >
      {choices.map((choice) => (
        <MenuItem key={choice} value={choice}>
          {choice}
        </MenuItem>
      ))}
    </Select>
  </FormControl>);
}

function CheckboxInput({
  onChange,
  value,
}: {
  onChange: any;
  value: boolean
}) {
  return <Checkbox
    onChange={onChange}
    checked={value}
    className="my-3 bg-white"
  />;
}

function FileInput({
  onChange,
  value,
}: {
  onChange: any;
  value: string
}) {
  return <FormControl className="my-3 bg-white" fullWidth>
    <MaterialInput
      type="file"
      onChange={onChange}
      value={value}
      inputProps={{accept:".pdf"}}
    />
  </FormControl>;
}

function DateInput({ label, onChange, value }: { label: string, onChange: any; value: number }) {
  return <LocalizationProvider dateAdapter={AdapterDayjs}>
    <FormControl className="my-3 bg-white" fullWidth>
      <DateTimePicker
        label={label}
        value={dayjs(value)}
        onChange={(day: Dayjs) => onChange(day.valueOf())}
        renderInput={(params) => <TextField {...params} />}
      />
    </FormControl>
  </LocalizationProvider>;
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
  onChange: (event: any) => void;
  value?: string | number | boolean;
  type: InputType;
  choices?: string[];
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
}) {
  let input = (
    <TextInput
      label={label}
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
        label={label}
        onChange={onChange}
        value={value as string}
        choices={choices}
      />
    );
  }

  if (type === InputType.File) {
    input = <FileInput onChange={onChange} value={value as string} />;
  }

  if (type === InputType.Date) {
    input = <DateInput label={label} onChange={onChange} value={value as number} />;
  }

  return (
    <div className={className}>
      <label>
        {input}
        {(type === InputType.Checkbox || type === InputType.File) && label}
      </label>
    </div>
  );
}

export default Input;
