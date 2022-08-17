import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

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
function AchievementForm({handleSubmit, onCancel, isLoading, buttonLabel, initialData = {}, events}) {
  const [type, setType] = React.useState(initialData.type);
  const [category, setCategory] = React.useState(initialData.category);

  const startDate = new Date(initialData.startDate);
  const endDate = new Date(initialData.endDate);

  return (
    <form className="w-full p-4 h-full flex flex-col" onSubmit={handleSubmit}>
      <Input
        label='Título'
        name='title'
        type='text'
        defaultValue={initialData.title}
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
        onChange={(event) => setType(event.target.value)}
        select
      >
        <MenuItem value='Individual'>Individual</MenuItem>
        <MenuItem value='Casa'>Casa</MenuItem>
      </Input>
      <Input
        label="Categoria"
        name="category"
        defaultValue={initialData.category}
        onChange={(event) => setCategory(event.target.value)}
        select
      >
        <MenuItem value='Manual'>Manual</MenuItem>
        <MenuItem value='Presença em Evento'>Presença em Evento</MenuItem>
        <MenuItem value='Presença em Tipo de Evento'>Presença em Tipo de Evento</MenuItem>
        <MenuItem value='Número de Conquistas'>Número de Conquistas</MenuItem>
      </Input>
      {
        category === 'Presença em Evento' && (
          <Input
            label="Id do Evento"
            name="eventId"
            defaultValue={initialData.event}
            select
          >
            { events.map((event, index) => {
              return (<MenuItem key={index} value={event.id}>{event.name}</MenuItem>);
            }) }
          </Input>
        )
      }
      {
        category === 'Presença em Tipo de Evento' && (
          <Input
            label="Tipo de Evento"
            name="eventType"
            defaultValue={initialData.eventType}
            select
          >
            <MenuItem value='Palestra'>Palestra</MenuItem>
            <MenuItem value='Minicurso'>Minicurso</MenuItem>
            <MenuItem value='Roda'>Roda</MenuItem>
            <MenuItem value='Feira'>Feira</MenuItem>
            <MenuItem value='Game Night'>Game Night</MenuItem>
            <MenuItem value='Concurso'>Concurso</MenuItem>
            <MenuItem value='Contest'>Contest</MenuItem>
          </Input>
        )
      }
      {
        (type === 'Casa' && (category === 'Presença em Evento' || category === 'Presença em Tipo de Evento')) ? (
          <Input
            label='Porcentagem mínima'
            name='minPercentage'
            type='number'
            inputProps={{min: 0, max: 100}}
            defaultValue={initialData.minPercentage || 70}
            fullWidth
          />
        ) : null
      }
      {
        (type === 'Individual' && category === 'Presença em Tipo de Evento') ? (
          <Input
            label='Número de presenças'
            name='numberOfPresences'
            type='number'
            inputProps={{min: 0}}
            defaultValue={initialData.numberOfPresences}
            fullWidth
          />
        ) : null
      }
      {
        category === 'Número de Conquistas' && (
          <Input
            label='Número de conquistas'
            name='numberOfAchievements'
            type='number'
            inputProps={{min: 0}}
            defaultValue={initialData.numberOfAchievements}
            fullWidth
          />
        )
      }
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

export default AchievementForm;
