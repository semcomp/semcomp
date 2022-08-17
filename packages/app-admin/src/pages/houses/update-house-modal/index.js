import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import EventForm from '../house-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function UpdateHouseModal({house, onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} submitEvent
   *
   * @return {object}
   */
  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const formElem = submitEvent.currentTarget;
    const name = formElem['name'].value;
    const description = formElem['description'].value;
    const telegramLink = formElem['telegramLink'].value;

    if (!name) return toast.error('You must provide a name');
    if (!description) return toast.error('You must provide a description');
    if (!telegramLink) return toast.error('You must provide a telegram link');

    const newHouse = {...house, name, description, telegramLink};

    setIsCreating(true);
    try {
      await API.updateHouse(house.id, newHouse);
      toast.success(`Casa '${house.name}' editado com sucesso!`);
      onSuccess(newHouse);
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
          <h1 className="text-4xl">Atualizar Casa</h1>
          <EventForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            initialData={house}
            buttonLabel='Update'
          />
        </div>
      </div>
    </Modal>
  );
}

export default UpdateHouseModal;
