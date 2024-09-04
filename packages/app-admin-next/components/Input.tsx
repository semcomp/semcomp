import { ReactNode, useEffect, useState } from "react";

import {
  Checkbox,
  FormControl,
  Input as MaterialInput,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { Info } from "@mui/icons-material";

export enum InputType {
  Select = "select",
  Autocomplete = "autocomplete",
  Checkbox = "checkbox",
  Text = "text",
  Number = "number",
  Password = "password",
  File = "file",
  Image = "image",
  Date = "date",
}

function TextInput({
  label,
  onChange,
  value,
  type,
  tooltip,
  autofocus,
  start,
  end,
}: {
  label: string;
  onChange: any;
  value: string;
  type: InputType;
  tooltip: any,
  autofocus: boolean,
  start?: ReactNode;
  end?: ReactNode;
}) {
  return (<>
    {
      tooltip && (
        <Tooltip arrow placement="top-start" title={tooltip ? tooltip : ""} enterTouchDelay={1}>
          <Info sx={{ color: "#002776" }} />
        </Tooltip>
      )
    }
    <TextField
      fullWidth
      autoFocus={autofocus}
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
  </>);
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

function AutoCompleteInput({
  label,
  onChange,
  value,
  labelKey,
  valueKey,
  options,
}: {
  label: string;
  onChange: any;
  value: string;
  labelKey: string;
  valueKey: string;
  options: Object[];
}) {
  const [actualValue, setActualValue] = useState<any>(null);
  
  useEffect(() => {
    if (options) {
        const option = options.find((option) => option[valueKey] === value);
        if (option) {
            setActualValue(option);
        }
    }
  }, [options]);

  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <Autocomplete
        options={options}
        value={actualValue}
        getOptionLabel={(option) => option[labelKey]}
        renderInput={(params) => <TextField {...params} label={label} />}
        onChange={(event, newValue) => {
          setActualValue(newValue);
          onChange(newValue ? newValue[valueKey] : null);
        }}
      />
    </FormControl>
  );
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

function ImageInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: any;
  value: string;
}) {
  return <FormControl className="my-3 bg-white" fullWidth>
    <MaterialInput
      type="file"
      onChange={onChange}
      value={value}
      inputProps={{accept:"image/*"}}
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
  tooltip,
  autofocus,
  start,
  end,
  className,
  labelKey,
  valueKey,
}: {
  label?: any;
  onChange: (event: any) => void;
  value?: string | number | boolean;
  type: InputType;
  choices?: string[] | Object[];
  tooltip?: any,
  autofocus?: boolean,
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  labelKey?: string;
  valueKey?: string;
}) {
  let input = (
    <TextInput
      label={label}
      onChange={onChange}
      value={value as string}
      type={type}
      tooltip={tooltip}
      autofocus={autofocus}
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
        choices={choices as string[]}
      />
    );
  }

  if (type === InputType.Autocomplete) {
    input = (
      <AutoCompleteInput
        label={label}
        onChange={onChange}
        value={value as string}
        labelKey={labelKey}
        valueKey={valueKey}
        options={choices as Object[]}
      />
    );
  }

  if (type === InputType.File) {
    input = <FileInput onChange={onChange} value={value as string} />;
  }

  if (type === InputType.Date) {
    input = <DateInput label={label} onChange={onChange} value={value as number} />;
  }

  if (type === InputType.Image) {
    input = <ImageInput label={label} onChange={onChange} value={value as string} />;
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
