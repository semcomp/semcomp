import { toast } from "react-toastify";
import {QrReader} from 'react-qr-reader';

import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import SemcompApi from "../../api/semcomp-api";
import { SemcompApiEvent } from "../../models/SemcompApiModels";

function MarkAttendanceModal({
  data,
  onRequestClose,
}: {
  data: SemcompApiEvent,
  onRequestClose: () => void,
}) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  let lastScannedUserId = '';
  async function handleSubmit(userId) {
    if (lastScannedUserId !== userId) {
      try {
        await semcompApi.markAttendance(data.id, userId);
        toast.success('Presença cadastrada');
      } catch (e) {
        toast.error('Erro ao cadastrar presença');
        console.error(e);
      }
    }
    lastScannedUserId = userId;
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        {data.name}
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <QrReader
          constraints={{facingMode: 'environment'}}
          scanDelay={1000}
          onResult={(result: any, error) => {
            console.log(result);
            console.log(error);
            if (!!result) {
              handleSubmit(result?.text);
            }

            if (!!error) {
              console.info(error);
            }
          }}
        />
      </div>
      <div className="w-full px-6">
        <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default MarkAttendanceModal;
