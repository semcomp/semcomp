import React from 'react';

import {Modal} from '@material-ui/core';

import LoadingButton from '../../../components/reusable/loading-button';

import './style.css';
import useDeleteData from '../../../libs/hooks/delete-data';

const DeleteConfirmationModal = ({data, isOpen, onRequestClose, onSuccessfulDelete, idExtractor, nameExtractor, deleteDataFunction}) => {
  const {deleteData, isDeleting} = useDeleteData(deleteDataFunction);

  /**
   * handleConfirm
   */
  async function handleConfirm() {
    const dataToDelete = data.map((item) => ({id: idExtractor(item), name: nameExtractor(item)}));
    try {
      await deleteData(dataToDelete);
      onSuccessfulDelete();
    } catch (_) {
      onRequestClose();
    }
  }

  return (
    <Modal open={isOpen} onClose={onRequestClose}>
      <div className="delete-confirmation-modal-component">
        <div className="card">
          <h1>Atenção</h1>
          <p>Você está prestes a deletar as seguintes linhas:</p>
          <div className="items-container">
            { data.map((item) => <p key={idExtractor(item)}>{nameExtractor(item)}</p>) }
          </div>
          <div className="buttons-container">
            <button
              onClick={onRequestClose}
              className="cancel"
            >Cancelar</button>
            <LoadingButton
              isLoading={isDeleting}
              onClick={handleConfirm}
              spinnerColor="black"
              className="confirm"
            >Confirmar</LoadingButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
