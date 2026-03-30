import React from 'react';
import API from '../../../api';
import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';
import UserForm from '../user-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function UpdateUserModal({user, onRequestClose, onSuccess}) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  /**
   * @param {object} submitEvent
   *
   * @return {object}
   */
  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const formElem = submitEvent.currentTarget;
    const name = formElem['name'].value;
    const course = formElem['course'].value;
    const nusp = formElem['nusp'].value;
    const email = formElem['email'].value;
    const paid = formElem['paid'].checked;
    const permission = formElem['permission'].checked;

    if (!name) return toast.error('You must provide a name');
    if (!email) return toast.error('You must provide an email');

    const newUser = {...user, name, course, nusp, email, paid, permission};

    setIsUpdating(true);
    try {
      const response = await API.updateUser(user.id, newUser);
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
          <h1 className="text-4xl">Update user</h1>
          <UserForm
            handleSubmit={handleSubmit}
            isLoading={isUpdating}
            onCancel={onRequestClose}
            initialData={user}
            buttonLabel='Update'
          />
        </div>
      </div>
    </Modal>
  );
}

export default UpdateUserModal;
