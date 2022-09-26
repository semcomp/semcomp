import { toast } from "react-toastify";
import ReactQrReader from 'react-qr-scanner'
import {QrReader} from 'react-qr-reader';

import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import SemcompApi from "../../api/semcomp-api";
import { SemcompApiEvent } from "../../models/SemcompApiModels";
import { useCallback, useState } from "react";

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

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);

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
        {/* <ReactQrReader
          videoId='video'
          scanDelay={500}
          onScan={(data) => {
            if (data) {
              handleSubmit(data);
            }
          }}
          onError={(error) => console.log(error)}
          maxImageSize={3840}
          // style={{width: "3840px", height: "3840px"}}
          // constraints={{facingMode: 'environment', width: 3840, height: 3840}}
          facingMode={"rear"}
        /> */}
        <QrReader
          videoId='video'
          scanDelay={500}
          onResult={(result: any, error) => {
            console.log(result);
            console.log(error);
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
            width: 3840,
            height: 3840
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
