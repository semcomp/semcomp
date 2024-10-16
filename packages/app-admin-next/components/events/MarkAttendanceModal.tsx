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

  async function handleSubmit(userId: string) {
    if (lastScannedUserId !== userId) {
      try {
        if(data.type === EventType.COFFEE){
          const permission = await semcompApi.getCoffeePermission(userId, coffeeItemId);
          if(permission){
            await semcompApi.markAttendance(data.id, userId);
            lastScannedUserId = userId;
            toast.success("Presença cadastrada!");
          }else{
            toast.error("Usuário não tem acesso à esse Coffee 'o'");
          }
        }else{
          await semcompApi.markAttendance(data.id, userId);
          lastScannedUserId = userId;
          toast.success("Presença cadastrada!");
        }
      } catch (e) {
        toast.error("Erro ao marcar presença :(");
        console.error(e);
        console.log(e?.response?.data?.message[0]);
      }
    } else {
      toast.error("Usuário já teve presença marcada");
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
