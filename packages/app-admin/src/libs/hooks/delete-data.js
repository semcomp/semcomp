import React from 'react';
import {toast} from 'react-toastify';
import Spinner from '../../components/reusable/spinner';

/**
 * @param {object} apiFunction
 *
 * @return {object}
 */
function useDeleteData(apiFunction) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  /**
   * @param {object} dataToDelete
   */
  async function deleteData(dataToDelete) {
    setIsDeleting(true);
    try {
      const promises = dataToDelete.map(async (data) => {
        const toastId = toast.info(<>Deletando {data.name}... <br/><Spinner strokeWidth={2} color='white' /></>, {autoClose: false});
        try {
          await apiFunction(data.id);
          toast.success(`${data.name} deletado com sucesso!`);
        } catch (e) {
          console.error(e);
          toast.error(`Falha ao deletar ${data.name}: ${e.errorMessage}`);
        } finally {
          toast.dismiss(toastId);
        }
      });
      await Promise.all(promises);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    isDeleting,
    deleteData,
  };
}

export default useDeleteData;
