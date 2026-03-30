import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import UserForm from '../user-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function UpdateAdminModal({user, onRequestClose, onSuccess}) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  /**
   * @param {object} submitEvent
   *
   * @return {object}
   */
  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const formElem = submitEvent.currentTarget;
    const email = formElem['email'].value;

    if (!email) return toast.error('You must provide an email');

    const newUser = {...user, email};

    setIsUpdating(true);
    try {
      const response = await API.updateAdmin(user.id, newUser);
      toast.success(`Usuário '${user.name}' editado com sucesso!`);
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal open onClose={onRequestClose}>
      <div className="w-full h-full p-4 flex justify-center items-center">
        <div className="bg-white rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Atualizar Administrador</h1>
          <UserForm
            handleSubmit={handleSubmit}
            isLoading={isUpdating}
            onCancel={onRequestClose}
            initialData={user}
            buttonLabel='Atualizar'
          />
        </div>
      </div>
    </Modal>
  );
}

export default UpdateAdminModal;
