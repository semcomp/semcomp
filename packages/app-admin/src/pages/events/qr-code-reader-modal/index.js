import React from 'react';
import {QrReader} from 'react-qr-reader';
import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import API from '../../../api';

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

/**
 * @param {object} param0
 *
 * @return {object}
 */
function QrCodeReaderModal({onRequestClose, onSuccess, event}) {
  let lastScannedUserId = '';

  /**
   * @param {object} userId
   *
   * @return {object}
   */
  async function handleSubmit(userId) {
    if (lastScannedUserId !== userId) {
      try {
        await API.markAttendance(event.id, userId);
        toast.success('Presença cadastrada');
      } catch (e) {
        toast.error('Erro ao cadastrar presença');
        console.error(e);
      }
    }
    lastScannedUserId = userId;
  }

  return (
    <Modal style={{height: '100%', overflowY: 'auto'}} open onClose={onRequestClose}>
      <div className="w-full p-4 flex justify-center items-center">
        <div className="bg-white h-full rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl text-center">{event.name}</h1>
          <div style={{width: '100%', height: '100%'}}>
            <QrReader
              constraints={{facingMode: 'environment'}}
              scanDelay="1000"
              onResult={(result, error) => {
                if (!!result) {
                  handleSubmit(result?.text);
                }

                if (!!error) {
                  console.info(error);
                }
              }}
              style={{width: '100%'}}
            />
            <div className="w-full flex items-center justify-end pt-4">
              <ErrorButton
                onClick={onRequestClose}
                className="cancel"
                variant="contained"
              >Cancelar</ErrorButton>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QrCodeReaderModal;
