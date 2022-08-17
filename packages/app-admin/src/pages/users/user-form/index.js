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
function UserForm({handleSubmit, onCancel, isLoading, buttonLabel, initialData = {}, isCreating}) {
  return (
    <form className="w-full p-4 flex flex-col" onSubmit={handleSubmit}>
      <Input
        label='Name'
        name='name'
        type='text'
        defaultValue={initialData.name}
        fullWidth
      />
      <Input
        label="Email"
        name="email"
        type='text'
        defaultValue={initialData.email}
        fullWidth
      />
      { isCreating ?
        <Input
          label="Password"
          name="password"
          type='text'
          fullWidth
        /> :
        <>
          <Input
            label='Course'
            name='course'
            type='text'
            defaultValue={initialData.course}
            fullWidth
          />
          <Input
            label='Nusp'
            name='nusp'
            type='text'
            defaultValue={initialData.nusp}
            fullWidth
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            type='text'
            defaultValue={initialData.phoneNumber}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={initialData.paid}
                name='paid'
              />
            }
            label='Pago?'
          />
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={initialData.permission}
                name='permission'
              />
            }
            label='Permissão?'
          />
        </>
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

export default UserForm;
