import { toast } from "react-toastify";
import { QrReader } from "react-qr-reader";
import { useCallback, useState } from "react";

import Modal from "../Modal";
import EventType from "../../libs/constants/event-types-enum";
import { useAppContext } from "../../libs/contextLib";
import SemcompApi from "../../api/semcomp-api";
import { SemcompApiEvent } from "../../models/SemcompApiModels";

function MarkAttendanceModal({
  data,
  onRequestClose,
  coffeeItemId,
}: {
  data: SemcompApiEvent;
  onRequestClose: () => void;
  coffeeItemId?: string;
}) {
  const {
    semcompApi,
  }: {
    semcompApi: SemcompApi;
  } = useAppContext();

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);

  let lastScannedUserId = "";
  // Loading para evitar que o usuário escaneie o mesmo QR code várias vezes
  // antes da requisição ser finalizada
  let loading = false;
  
  function showToastMessage(message: string, userId: string) {
    if (message) {
      if (message === "Presença já cadastrada!") {
        toast.info(message);
      } else {
        lastScannedUserId = userId;
        toast.success(message);
      }
    } else {
      toast.success("Presença cadastrada!");
    }
  }

  async function handleSubmit(userId: string) {
    if (!loading && lastScannedUserId !== userId) {
      loading = true;
      
      try {
        if (data.type === EventType.COFFEE) {
          const permission = await semcompApi.getCoffeePermission(userId, coffeeItemId);
          
          if (permission) {
            const response = await semcompApi.markAttendance(data.id, userId);

            showToastMessage(response.message, userId);
          } else {
            toast.error("Usuário não tem acesso à esse Coffee 'o'");
          }
        } else {
          const response = await semcompApi.markAttendance(data.id, userId);
          showToastMessage(response.message, userId);
        }
      } catch (e) {
        toast.error("Erro ao marcar presença :(");
        console.error(e);
        console.log(e?.response?.data?.message[0]);
      } finally {
        loading = false;
      }
    } else if (!loading && lastScannedUserId === userId) {
      toast.warning("Usuário já teve a presença cadastrada!");
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="w-full bg-black text-white text-center text-xl font-bold p-6">
        {data.name}
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <QrReader
          videoId="video"
          scanDelay={500}
          onResult={(result: any, error) => {
            if (result) {
              handleSubmit(result?.text);
            }

            setTimeout(forceUpdate, 500);
          }}
          constraints={{
            facingMode: "environment",
          }}
        />
      </div>
      <div className="w-full px-6">
        <button
          className="w-full bg-red-500 text-white py-3 px-6 my-6"
          type="button"
          onClick={onRequestClose}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default MarkAttendanceModal;
