import { styled } from '@mui/material/styles';
import Button, { ButtonProps } from '@mui/material/Button';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Spinner from '../reusable/Spinner';

const ErrorButton = styled(Button)<ButtonProps>(({ theme }) => ({
  contained: {
    'backgroundColor': theme.palette.error.main,
    'color': theme.palette.getContrastText(theme.palette.error.main),
    'margin': '0 1rem',
    '&:hover': {
      backgroundColor: theme.palette.error.light,
    },
  },
}));

const SuccessButton = styled(Button)<ButtonProps>(({ theme }) => ({
  contained: {
    'backgroundColor': theme.palette.success.dark,
    'color': theme.palette.getContrastText(theme.palette.success.dark),

    '&:hover': {
      backgroundColor: theme.palette.success.main,
    },
  },
}));

const Input = styled(TextField)<TextFieldProps>(({ theme }) => ({
  root: {
    margin: `${theme.spacing(1)}px 0`,
  },
}));

/**
 * @param {object} param
 *
 * @return {object}
 */
function UserForm({handleSubmit, onCancel, isLoading, buttonLabel, initialData = {} as any, isCreating}) {
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
