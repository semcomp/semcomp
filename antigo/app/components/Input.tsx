import { ReactNode, useState } from "react";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Input as MaterialInput,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  SelectChangeEvent,
  OutlinedInput,
  ListItemText,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Info } from "@mui/icons-material";

export enum InputType {
  Select = "select",
  MultiSelect = "multiSelect",
  Checkbox = "checkbox",
  Text = "text",
  Number = "number",
  Password = "password",
  File = "file",
  Date = "date",
  MultiCheckbox = "MultiCheckbox",
}

function TextInput({
  label,
  onChange,
  value,
  type,
  tooltip,
  autofocus,
  placeholder,
  start,
  end,
  disabled = false,
}: {
  label: string;
  onChange: any;
  value: string;
  type: InputType;
  tooltip: any;
  autofocus: boolean;
  placeholder: string,
  start?: ReactNode;
  end?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <>
      {tooltip ? (
        <>
          <div className="flex">
            <p className="pb-4">{label}</p>
            <Tooltip
              arrow
              placement="top-start"
              title={tooltip ? tooltip : ""}
              enterTouchDelay={1}
            >
              <Info
                sx={{ color: "#fffff", paddingX: "2px", marginY: "-1px" }}
              />
            </Tooltip>
          </div>
          <TextField
            fullWidth
            autoFocus={autofocus}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            type={type}
            variant="outlined"
            className="my-3 bg-white rounded-lg"
            disabled={disabled}
            InputProps={{
              startAdornment: start,
              endAdornment: end,
            }}
          />
        </>
      ) : (
        <>
          <p className="pb-2">{label}</p>
          <TextField
            fullWidth
            autoFocus={autofocus}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            type={type}
            variant="outlined"
            className="my-3 bg-white rounded-lg"
            disabled={disabled}
            InputProps={{
              startAdornment: start,
              endAdornment: end,
            }}
          />
        </>
      )}
    </>
  );
}

function SelectInput({
  label,
  onChange,
  value,
  choices,
  disabled = false,
  placeholder = "Selecione uma opção",
}: {
  label: string;
  onChange: any;
  value: string;
  choices: string[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <FormControl className="my-3" fullWidth>
      <p className="pb-4">{label}</p>
      <Select
        className="bg-white"
        onChange={onChange}
        value={value}
        labelId="label"
        displayEmpty
        disabled={disabled}
        renderValue={(selected) => {
          if (selected === "") {
            return <span className="text-gray-400">{placeholder}</span>;
          }
          return (
            <span className={disabled ? "text-gray-500" : ""}>{selected}</span>
          );
        }}
        sx={{
          "&.Mui-disabled": {
            backgroundColor: "#f5f5f5",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#e0e0e0",
            },
          },
        }}
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {choices.map((choice) => (
          <MenuItem key={choice} value={choice}>
            {choice}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function MultipleSelectInput({
  label,
  onChange,
  value,
  choices,
  valueLabel,
  disabled = false,
}: {
  label: string;
  onChange: (event: any) => void;
  value: string[];
  choices: any[];
  valueLabel?: string;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(value);
  const handleSelectChange = (event: SelectChangeEvent<typeof selected>) => {
    const {
      target: { value },
    } = event;

    const newValue = typeof value === "string" ? value.split(",") : value;
    setSelected(newValue);
    onChange(event);
  };

  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <InputLabel id="multiple-checkbox-label">{label}</InputLabel>
      <Select
        onChange={handleSelectChange}
        value={selected}
        multiple={true}
        labelId="multiple-checkbox-label"
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected.join(", ")}
        disabled={disabled}
      >
        {choices.map((choice) => {
          const itemValue =
            typeof choice === "string"
              ? choice
              : choice[valueLabel || "name" || "label" || "id"];
          const itemLabel =
            typeof choice === "string"
              ? choice
              : choice[valueLabel || "name" || "label" || "id"];

          return (
            <MenuItem key={itemValue} value={itemValue}>
              <Checkbox checked={selected.indexOf(itemValue) > -1} />
              <ListItemText primary={itemLabel} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function RadioInput({
  label,
  onChange,
  value,
  choices,
  disabled = false,
}: {
  label: string;
  onChange: any;
  value: string;
  choices: string[];
  disabled?: boolean;
}) {
  return (
    <FormControl>
      <FormLabel id="label">{label}</FormLabel>
      <RadioGroup aria-labelledby="label" value={value} onChange={onChange}>
        {choices.map((choice) => (
          <FormControlLabel
            key={choice}
            value={choice}
            control={<Radio />}
            label={choice}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

function CheckboxInput({
  onChange,
  value,
  disabled = false,
}: {
  onChange: any;
  value: boolean;
  disabled?: boolean;
}) {
  return (
    <Checkbox
      onChange={onChange}
      checked={value}
      className="my-3 bg-white"
      disabled={disabled}
      sx={{
        "&.Mui-checked": {
          color: "#00B4D8",
        },
        "&.MuiCheckbox-root": {
          color: "#242d5c",
        },
      }}
    />
  );
}

function FileInput({
  onChange,
  value,
  disabled = false,
}: {
  onChange: any;
  value: string;
  disabled?: boolean;
}) {
  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <MaterialInput
        type="file"
        onChange={onChange}
        value={value}
        inputProps={{ accept: ".pdf" }}
        disabled={disabled}
      />
    </FormControl>
  );
}

function DateInput({
  label,
  onChange,
  value,
  disabled = false,
}: {
  label: string;
  onChange: any;
  value: number;
  disabled?: boolean;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl className="my-2 bg-white" fullWidth>
        <DateTimePicker
          label={label}
          value={dayjs(value)}
          onChange={(day: Dayjs) => onChange(day.valueOf())}
          renderInput={(params) => <TextField {...params} />}
          disabled={disabled}
        />
      </FormControl>
    </LocalizationProvider>
  );
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
  valueLabel,
  placeholder,
  disabled = false,
}: {
  label?: any;
  onChange: (event: any) => void;
  value?: string | string[] | number | boolean;
  type: InputType;
  choices?: any[];
  tooltip?: any;
  autofocus?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  valueLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  let input = (
    <TextInput
      label={label}
      onChange={onChange}
      value={value as string}
      placeholder={placeholder}
      type={type}
      tooltip={tooltip}
      autofocus={autofocus}
      start={start}
      end={end}
      disabled={disabled}
    />
  );

  if (type === InputType.Checkbox) {
    input = (
      <CheckboxInput
        onChange={onChange}
        value={value as boolean}
        disabled={disabled}
      />
    );
  }

  if (type === InputType.Select) {
    input = (
      <SelectInput
        label={label}
        onChange={onChange}
        value={value as string}
        choices={choices as string[]}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  if (type === InputType.File) {
    input = (
      <FileInput
        onChange={onChange}
        value={value as string}
        disabled={disabled}
      />
    );
  }

  if (type === InputType.MultiSelect) {
    input = (
      <MultipleSelectInput
        label={label}
        onChange={onChange}
        value={value as string[]}
        choices={choices as any[]}
        valueLabel={valueLabel}
        disabled={disabled}
      />
    );
  }

  if (type === InputType.Date) {
    input = (
      <DateInput
        label={label}
        onChange={onChange}
        value={value as number}
        disabled={disabled}
      />
    );
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
