import { ReactNode } from "react";
import {
  Checkbox,
  FormControl,
  Input as MaterialInput,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Info } from "@mui/icons-material";

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
  placeholder, // Adiciona placeholder
  onChange,
  value,
  type,
  tooltip,
  autofocus,
  start,
  end,
}: {
  label: string;
  placeholder?: string; // Define o tipo para placeholder
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  type: InputType;
  tooltip?: string;
  autofocus?: boolean;
  start?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <>
      {tooltip && (
        <Tooltip
          arrow
          placement="top-start"
          title={tooltip}
          enterTouchDelay={1}
        >
          <Info sx={{ color: "#002776" }} />
        </Tooltip>
      )}
      <TextField
        fullWidth
        autoFocus={autofocus}
        onChange={onChange}
        value={value}
        type={type}
        label={label}
        placeholder={placeholder} // Define o placeholder aqui
        variant="outlined"
        className="my-3 bg-white"
        InputProps={{
          startAdornment: start,
          endAdornment: end,
        }}
      />
    </>
  );
}

function SelectInput({
  label,
  onChange,
  value,
  choices,
}: {
  label: string;
  onChange: (event: any) => void;
  value: string;
  choices: string[];
}) {
  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <InputLabel id="label">{label}</InputLabel>
      <Select onChange={onChange} value={value} label={label} labelId="label">
        {choices.map((choice) => (
          <MenuItem key={choice} value={choice}>
            {choice}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function CheckboxInput({
  onChange,
  value,
}: {
  onChange: (event: any) => void;
  value: boolean;
}) {
  return (
    <FormControl className="my-3 bg-white">
      <Checkbox onChange={onChange} checked={value} />
    </FormControl>
  );
}

function FileInput({
  onChange,
  value,
}: {
  onChange: (event: any) => void;
  value: string;
}) {
  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <MaterialInput
        type="file"
        onChange={onChange}
        value={value}
        inputProps={{ accept: ".pdf" }}
      />
    </FormControl>
  );
}

function DateInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl className="my-3 bg-white" fullWidth>
        <DateTimePicker
          label={label}
          value={dayjs(value)}
          onChange={(day: Dayjs) => onChange(day.valueOf())}
          renderInput={(params) => <TextField {...params} />}
        />
      </FormControl>
    </LocalizationProvider>
  );
}

function Input({
  label,
  placeholder, // Adiciona placeholder
  onChange,
  value,
  type,
  choices,
  tooltip,
  autofocus,
  start,
  end,
  className,
}: {
  label?: string;
  placeholder?: string; // Define o tipo para placeholder
  onChange: (event: any) => void;
  value?: string | number | boolean;
  type: InputType;
  choices?: string[];
  tooltip?: string;
  autofocus?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
}) {
  let input;

  switch (type) {
    case InputType.Checkbox:
      input = <CheckboxInput onChange={onChange} value={value as boolean} />;
      break;
    case InputType.Select:
      input = (
        <SelectInput
          label={label!}
          onChange={onChange}
          value={value as string}
          choices={choices!}
        />
      );
      break;
    case InputType.File:
      input = <FileInput onChange={onChange} value={value as string} />;
      break;
    case InputType.Date:
      input = (
        <DateInput label={label!} onChange={onChange} value={value as number} />
      );
      break;
    default:
      input = (
        <TextInput
          label={label!}
          placeholder={placeholder} // Passa placeholder para TextInput
          onChange={onChange}
          value={value as string}
          type={type}
          tooltip={tooltip}
          autofocus={autofocus}
          start={start}
          end={end}
        />
      );
      break;
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
