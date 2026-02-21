import React from 'react';

import Modal from '@material-ui/core/Modal';
import {toast} from 'react-toastify';

import API from '../../../api';
import QuestionForm from '../hard-to-click-question-form';

/**
 * @param {object} param
 *
 * @return {object}
 */
function CreateQuestionModal({onRequestClose, onSuccess}) {
  const [isCreating, setIsCreating] = React.useState(false);

  /**
   * @param {object} event
   *
   * @return {object}
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const formElem = event.currentTarget;
    const questionString = formElem['question'].value;
    const answer = formElem['answer'].value;
    const index = formElem['index'].value;
    const imgUrl = formElem['imgUrl'].value;

    if (!questionString) return toast.error('You must provide a question');
    if (!answer) return toast.error('You must provide an answer');
    if (!index) return toast.error('You must provide am index');

    const newQuestion = {question: questionString, answer, index, imgUrl};

    setIsCreating(true);
    try {
      const response = await API.createHardToClickQuestion(newQuestion);
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
          <h1 className="text-4xl">Criar Pergunta</h1>
          <QuestionForm
            handleSubmit={handleSubmit}
            isLoading={isCreating}
            onCancel={onRequestClose}
            buttonLabel='Criar'
          />
        </div>
      </div>
    </Modal>
  );
}

export default CreateQuestionModal;
