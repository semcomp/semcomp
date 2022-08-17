import React from 'react';

import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
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
 * @param {object} param
 *
 * @return {object}
 */
function QuestionForm({handleSubmit, onCancel, isLoading, buttonLabel, initialData = {}}) {
  return (
    <form className="w-full p-4 flex flex-col" onSubmit={handleSubmit}>
      <Input
        label="Index"
        name="index"
        type="number"
        defaultValue={initialData.index}
      />
      <Input
        label='Título'
        name='title'
        type='text'
        defaultValue={initialData.title}
        fullWidth
      />
      <Input
        label='Pergunta'
        name='question'
        type='text'
        defaultValue={initialData.question}
        fullWidth
      />
      <Input
        label='Dica'
        name='clue'
        type='text'
        defaultValue={initialData.clue}
        fullWidth
      />
      <Input
        label='Resposta'
        name='answer'
        type='text'
        defaultValue={initialData.answer}
        fullWidth
      />
      <Input
        label='URL da Imagem'
        name='imgUrl'
        type='text'
        defaultValue={initialData.imgUrl}
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={initialData.isLegendary}
            name='isLegendary'
          />
        }
        label='É lendário?'
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

export default QuestionForm;
