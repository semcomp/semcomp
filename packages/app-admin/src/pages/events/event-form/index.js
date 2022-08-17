import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Spinner from '../../../components/reusable/spinner';

const ErrorButton = withStyles((theme) => ({
  contained: {
    'backgroundColor': theme.palette.error.main,
    'color': theme.palette.getContrastText(theme.palette.error.main),
    'margin': '0 1rem',
    '&:hover': {
      backgroundColor: theme.palette.error.light,
    },
  },
}))(Button);

const SuccessButton = withStyles((theme) => ({
  contained: {
    'backgroundColor': theme.palette.success.dark,
    'color': theme.palette.getContrastText(theme.palette.success.dark),

    '&:hover': {
      backgroundColor: theme.palette.success.main,
    },
  },
}))(Button);

const Input = withStyles((theme) => ({
  root: {
    margin: `${theme.spacing(1)}px 0`,
  },
}))(TextField);

/**
 * @param {object} dateObj
 *
 * @return {object}
 */
function date2MUIString(dateObj) {
  const year = dateObj.getFullYear().toString().padStart(4, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const date = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
}

/**
 * @param {object} param
 *
 * @return {object}
 */
function EventForm({handleSubmit, onCancel, isLoading, buttonLabel, initialData = {}}) {
  const startDate = new Date(initialData.startDate);
  const endDate = new Date(initialData.endDate);

  return (
    <form className="w-full p-4 h-full flex flex-col" onSubmit={handleSubmit}>
      <Input
        label='Nome'
        name='name'
        type='text'
        defaultValue={initialData.name}
        fullWidth
      />
      <Input
        label='Facilitador'
        name='speaker'
        type='text'
        defaultValue={initialData.speaker}
        fullWidth
      />
      <Input
        label='Descrição'
        name='description'
        type='text'
        defaultValue={initialData.description}
        fullWidth
      />
      <Input
        label='Máximo de Inscritos'
        name='maxOfSubscriptions'
        type='number'
        inputProps={{min: 0}}
        defaultValue={initialData.maxOfSubscriptions}
        fullWidth
      />
      <Input
        label="Início"
        name="start-date"
        type="datetime-local"
        defaultValue={date2MUIString(startDate)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Input
        label="Término"
        name="end-date"
        type="datetime-local"
        defaultValue={date2MUIString(endDate)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Input
        label="Tipo"
        name="type"
        defaultValue={initialData.type}
        select
      >
        <MenuItem value='Palestra'>Palestra</MenuItem>
        <MenuItem value='Minicurso'>Minicurso</MenuItem>
        <MenuItem value='Roda'>Roda</MenuItem>
        <MenuItem value='Feira'>Feira</MenuItem>
        <MenuItem value='Game Night'>Game Night</MenuItem>
        <MenuItem value='Concurso'>Concurso</MenuItem>
        <MenuItem value='Contest'>Contest</MenuItem>
        <MenuItem value='Coffee'>Coffee</MenuItem>
        <MenuItem value='Cultural'>Cultural</MenuItem>
      </Input>
      <Input
        label="Link"
        name="link"
        type="text"
        defaultValue={initialData.link}
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.isInGroup}
            name='isInGroup'
          />
        }
        label='Em grupo?'
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.showOnSchedule}
            name='showOnSchedule'
          />
        }
        label='Mostrar no Cronograma'
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.showStream}
            name='showStream'
          />
        }
        label='Mostrar Stream'
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.showOnSubscribables}
            name='showOnSubscribables'
          />
        }
        label='Mostrar nas Inscrições'
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.needInfoOnSubscription}
            name='needInfoOnSubscription'
          />
        }
        label='Precisa de informações adicionais para inscrição?'
      />
      <div className="w-full flex items-center justify-end pt-4">
        <ErrorButton
          onClick={onCancel}
          className="cancel"
          variant="contained"
        >Cancelar</ErrorButton>
        <SuccessButton
          variant="contained"
          type="submit"
        >{buttonLabel} { isLoading && <Spinner color='white' strokeWidth={2} className='pl-2' /> }</SuccessButton>
      </div>
    </form>
  );
}

export default EventForm;
