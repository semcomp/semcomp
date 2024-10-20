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
  ListItemText,
  SelectChangeEvent,
  OutlinedInput,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { Info } from "@mui/icons-material";

export enum InputType {
  Select = "select",
  MultipleSelect = "multipleSelect",
  Autocomplete = "autocomplete",
  Checkbox = "checkbox",
  Text = "text",
  TextArea = "textarea",
  Number = "number",
  Password = "password",
  File = "file",
  Image = "image",
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
  disabled
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
  disabled?: boolean
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
        disabled={disabled}
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
      <Select onChange={onChange} value={value} label={label} labelId="label" onClick={(e) => e.stopPropagation()}>
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
        value={selected} multiple={true}
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
  disabled,
}: {
  onChange?: (event: any) => void;
  value: boolean;
  disabled?: boolean;
}) {
  return (
    <FormControl className="my-3 bg-transparent">
      <Checkbox onChange={onChange} checked={value} disabled={disabled} />
    </FormControl>
  );
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

function TextAreaInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: any;
  value: string;
}) {
  return (
    <FormControl className="my-3 bg-white" fullWidth>
      <TextField
        label={label}
        onChange={onChange}
        value={value}
        multiline
        minRows={1}
        variant="outlined"
      />
    </FormControl>
  );
};

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
  type,
  onChange,
  label,
  placeholder,
  value,
  choices,
  tooltip,
  autofocus,
  start,
  end,
  className,
  labelKey,
  valueKey,
  disabled,
}: {
  label?: string;
  placeholder?: string;
  onChange?: (event: any) => void;
  value?: string | string[] | number | boolean;
  type: InputType;
  choices?: string[] | Object[];
  tooltip?: string;
  autofocus?: boolean;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  labelKey?: string;
  valueKey?: string;
  disabled?: boolean;
}) {
  let input = (
    <TextInput
      label={label!}
      onChange={onChange}
      placeholder={placeholder}
      value={value as string}
      type={type}
      tooltip={tooltip}
      autofocus={autofocus}
      start={start}
      end={end}
      disabled={disabled}
    />
  );

  if (type === InputType.Checkbox) {
    input = <CheckboxInput onChange={onChange} value={value as boolean} disabled={disabled} />;
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

  if (type === InputType.MultipleSelect && Array.isArray(value)) {
    input = (
      <MutipleSelectInput
        label={label}
        onChange={onChange}
        value={value as string[]}
        choices={choices as object[]}
        valueLabel={labelKey}
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

  if (type === InputType.TextArea) {
    input = <TextAreaInput label={label} onChange={onChange} value={value as string} />;
  }

  return (
    <div className={className}>
      <label className="flex items-center">
        {input}
        {(type === InputType.Checkbox || type === InputType.File) && label}
      </label>
    </div>
  );
}

export default Input;
