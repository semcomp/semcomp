import { toast } from "react-toastify";
import {QrReader} from 'react-qr-reader';

import Modal from "../Modal";
import { useCallback, useState } from "react";
import API from "../../api";

function MarkAttendanceModal({
  onRequestClose,
}: {
  onRequestClose: () => void,
}) {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);

  let lastScannedEventId = '';
  async function handleSubmit(eventId) {
    if (lastScannedEventId !== eventId) {
      try {
        await API.events.markAttendanceByQrCode(eventId);
        toast.success('Presença cadastrada');
      } catch (error) {
        toast.error('Erro ao cadastrar presença');
        console.error(error);
      }
    }
    lastScannedEventId = eventId;
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        Scanear Presença
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <QrReader
          videoId='video'
          scanDelay={500}
          onResult={(result: any, error) => {
            if (result) {
              handleSubmit(result?.text);
            }

            if (error) {
              console.info(error);
            }

            setTimeout(forceUpdate, 500);
          }}
          constraints={{
            aspectRatio: 3840,
            facingMode: 'environment',
            height: 3840,
          }}/>
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
