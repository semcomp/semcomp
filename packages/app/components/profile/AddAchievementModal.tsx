import { toast } from "react-toastify";
import {QrReader} from 'react-qr-reader';

import Modal from "../Modal";
import { useCallback, useState } from "react";
import API from "../../api";

function AddAchievementModal({
  onRequestClose,
}: {
  onRequestClose: () => void,
}) {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);
  let lastScannedAchievementId = '';

  async function handleSubmit(achievementId: string) {
    if (lastScannedAchievementId !== achievementId) {
      try {
        await API.achievements.readUserAchievementByQrCode(achievementId);
        toast.success('Conquista recebida!');
      } catch (error) {
        if (error.data?.message) {
          toast.error(error.data.message[0]);
        } else {
          toast.error('Erro ao receber conquista');
        }
      }
    }
    lastScannedAchievementId = achievementId;
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        Scanear Conquista
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
            facingMode: 'environment',
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

export default AddAchievementModal;
