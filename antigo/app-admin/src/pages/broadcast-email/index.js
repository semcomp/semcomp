import React from 'react';
import Sidebar from '../../components/layout/sidebar';
import LoadingButton from '../../components/reusable/loading-button';
import API from '../../api';
import {toast} from 'react-toastify';
import {TextField, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const Input = withStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
}))(TextField);

const WarningText = withStyles((theme) => ({
  root: {
    color: theme.palette.error.main,
    margin: `${theme.spacing(4)}px 0`,
  },
}))(Typography);

const Title = withStyles((theme) => ({
  root: {
    fontSize: '2.5rem',
  },
}))(Typography);

const styles = {
  root: 'flex min-h-full',
  form: 'p-4 flex flex-col w-full max-w-md m-4 border border-gray-500 rounded',
  title: 'text-4xl text-center',
  warningText: 'text-red-500 my-8',
};

/**
 * @return {object}
 */
function BroadcastEmail() {
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSendingEmail) return;

    const formElem = event.currentTarget;

    const subject = formElem['subject'].value;
    const text = formElem['text'].value;
    const html = formElem['html'].value;

    if (!subject) return toast.error('Você deve fornecer um assunto');
    if (!text) return toast.error('Você deve fornecer um texto');
    if (!html) return toast.error('Você deve fornecer um html');

    setIsSendingEmail(true);
    try {
      await API.broadcastEmail(subject, text, html);
      toast.success('E-mail enviado com sucesso!');
      formElem.reset();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <div className={styles.root}>
      <Sidebar />
      <form className={styles.form} onSubmit={handleSubmit}>
        <Title className={styles.title}>Enviar email</Title>
        <WarningText>
          ATENÇÃO: Este email será enviado para <strong>TODOS</strong> os
          participantes da Semcomp.
        </WarningText>
        <Input
          label='Assunto'
          fullWidth
          name='subject'
        />
        <Input
          label='Corpo (apenas texto)'
          fullWidth
          name='text'
          multiline
          rows={3}
        />
        <Input
          label='Corpo (texto e HTML)'
          fullWidth
          name='html'
          multiline
          rows={3}
        />
        <LoadingButton variant="contained" isLoading={isSendingEmail} type="submit">
          Enviar
        </LoadingButton>
      </form>
    </div>
  );
}

export default BroadcastEmail;
