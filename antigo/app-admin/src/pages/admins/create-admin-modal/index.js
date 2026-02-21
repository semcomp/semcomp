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
function CreateAdminModal({onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const formElem = event.currentTarget;
    const email = formElem['email'].value;
    const password = formElem['password'].value;

    if (!email) return toast.error('You must provide an email');
    if (!password) return toast.error('You must provide a password');

    const newUser = {
      email,
      password,
      adminRole: 0,
    };

    setIsCreating(true);
    try {
      const response = await API.createAdmin(newUser);
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal open onClose={onRequestClose}>
      <div className="w-full h-full p-4 flex justify-center items-center">
        <div className="bg-white rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Criar Administrador</h1>
          <UserForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            buttonLabel='Criar'
            isCreating
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateAdminModal;
