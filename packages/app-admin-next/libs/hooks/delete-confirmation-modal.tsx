import { useState } from 'react';

import DeleteConfirmationModal from '../../components/layout/DeleteConfirmationModal';

/**
 * @param {object} param
 *
 * @return {object}
 */
function useDeleteConfirmationModal({ data, setData, idExtractor, nameExtractor, deleteDataFunction }) {
  const [deleteInfo, setDeleteInfo] = useState({ isDeleting: false, shouldOpenModal: false, dataToDelete: null });

  /**
   * @param {object} deletedRows
   *
   * @return {object}
   */
  function handleTableDeleteEvent(deletedRows) {
    const { data: indexes } = deletedRows;
    const dataToDelete = indexes.map(({ dataIndex }) => data[dataIndex]);
    setDeleteInfo({ isDeleting: false, dataToDelete, shouldOpenModal: true });
    return false;
  }

  /**
   * handleModalDeleteEvent
   */
  function handleModalDeleteEvent() {
    const newData = data.filter((item) =>
      deleteInfo.dataToDelete.every((deletedData) => deletedData !== item),
    );
    setData(newData);
    setDeleteInfo({ isDeleting: false, dataToDelete: null, shouldOpenModal: false });
  }

  /**
   * closeModal
   */
  function closeModal() {
    setDeleteInfo({ isDeleting: false, shouldOpenModal: false, dataToDelete: null });
  }

  const deleteConfirmationModalElement: any = deleteInfo.shouldOpenModal ?
    (<DeleteConfirmationModal
      data= { deleteInfo.dataToDelete }
      isOpen
  idExtractor = { idExtractor }
  nameExtractor = { nameExtractor }
  onRequestClose = { closeModal }
  onSuccessfulDelete = { handleModalDeleteEvent }
  deleteDataFunction = { deleteDataFunction }
    />) : null;

  return {
    handleTableDeleteEvent,
    deleteConfirmationModalElement,
  };
}

export default useDeleteConfirmationModal;
