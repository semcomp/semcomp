import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import HouseForm from '../house-form';

/**
 * @param {object} param0
 *
 * @return {object}
 */
function CreateEventModal({onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const formElem = event.currentTarget;
    const name = formElem['name'].value;
    const description = formElem['description'].value;
    const telegramLink = formElem['telegramLink'].value;

    if (!name) return toast.error('You must provide a name');
    if (!description) return toast.error('You must provide a description');
    if (!telegramLink) return toast.error('You must provide a telegram link');

    const newHouse = {name, description, telegramLink};

    setIsCreating(true);
    try {
      const response = await API.createHouse(newHouse);
      onSuccess(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal style={{height: '100%', overflowY: 'auto'}} open onClose={onRequestClose}>
      <div className="w-full p-4 flex justify-center items-center">
        <div className="bg-white h-full rounded-lg p-4 flex flex-col items-center w-full max-w-lg">
          <h1 className="text-4xl">Criar Casa</h1>
          <HouseForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            buttonLabel='Create'
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateEventModal;
