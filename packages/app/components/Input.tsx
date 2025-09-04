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
  tooltip: any;
  autofocus: boolean;
  start?: ReactNode;
  end?: ReactNode;
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
              <Info sx={{ color: "#fffff", paddingX: "2px"}} />
            </Tooltip>
          </div>
          <TextField
            fullWidth
            autoFocus={autofocus}
            onChange={onChange}
            value={value}
            type={type}
            variant="outlined"
            className="my-3 bg-white rounded-lg"
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
            value={value}
            type={type}
            variant="outlined"
            className="my-3 bg-white rounded-lg"
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
}: {
  label: string;
  onChange: any;
  value: string;
  choices: string[];
}) {
  return (
    <FormControl className="my-3" fullWidth>
      {/* <InputLabel id="label">{label}</InputLabel> */}
      <p className="pb-4">{label}</p>
      <Select
        className="bg-white"
        onChange={onChange}
        value={value}
        labelId="label"
        placeholder="placeholder"
        displayEmpty
      >
        {choices.map((choice) => (
          <MenuItem key={choice} value={choice}>
            {choice}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function MutipleSelectInput({
  label,
  onChange,
  value,
  choices,
  valueLabel,
}: {
  label: string;
  onChange: (event: any) => void;
  value: string[];
  choices: object[];
  valueLabel: string;
}) {
  const [selected, setSelected] = useState<string[]>(value);
  const handleSelectChange = (event: SelectChangeEvent<typeof selected>) => {
    const {
      target: { value },
    } = event;
    
    setSelected(typeof value === 'string' ? value.split(',') : value);
    onChange(typeof value === 'string' ? value.split(',') : value);
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
        renderValue={(selected) => selected.join(', ')}
      >
        {choices.map((choice) => (
          <MenuItem key={choice[valueLabel]} value={choice[valueLabel]}>
            <Checkbox checked={selected.indexOf(choice[valueLabel]) > -1} />
            <ListItemText primary={choice[valueLabel]} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function RadioInput({
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
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

function CheckboxInput({ onChange, value }: { onChange: any; value: boolean }) {
  return (
    <Checkbox 
      onChange={onChange} 
      checked={value} 
      className="my-3 bg-white" 
      sx={{
        '&.Mui-checked': {
          color: '#00B4D8',
        },
        '&.MuiCheckbox-root': {
          color: '#242d5c',
        }
      }}
    />
  );
}

function FileInput({ onChange, value }: { onChange: any; value: string }) {
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
  onChange: any;
  value: number;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl className="my-2 bg-white" fullWidth>
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
}: {
  label?: any;
  onChange: (event: any) => void;
  value?: string | string[] | number | boolean;
  type: InputType;
  choices?: string[] | object[];
  tooltip?: any;
  autofocus?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  valueLabel?: string;
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

  if (type === InputType.File) {
    input = <FileInput onChange={onChange} value={value as string} />;
  }

  if (type === InputType.MultiSelect) {
    input = (
      <MutipleSelectInput
        label={label}
        onChange={onChange}
        value={value as string[]}
        choices={choices as object[]}
        valueLabel={valueLabel}
      />
    );
  }

  if (type === InputType.Date) {
    input = (
      <DateInput label={label} onChange={onChange} value={value as number} />
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
