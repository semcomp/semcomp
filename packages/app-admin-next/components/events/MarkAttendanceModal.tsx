import { toast } from "react-toastify";
import { QrReader } from "react-qr-reader";

import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import SemcompApi from "../../api/semcomp-api";
import { SemcompApiEvent } from "../../models/SemcompApiModels";
import { useCallback, useState } from "react";

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

  async function handleSubmit(userId) {
    if (lastScannedUserId !== userId) {
      console.log(userId);
      try {
        if(data.type === 'Coffee'){
          const permission = await semcompApi.getCoffeePermission(data.id, userId, coffeeItemId);
          if(permission){
            //await semcompApi.markAttendance(data.id, userId);
            toast.success("Presença cadastrada");
          }else{
            toast.success("Usuário não tem acesso à esse Coffee");
          }
        }else{
          // await semcompApi.markAttendance(data.id, userId);
          toast.success("Presença cadastrada");
        }
      } catch (e) {
        toast.error(e?.response?.data?.message[0]);
        console.error(e);
        console.log(e.response.data.message);
      }
    }
    lastScannedUserId = userId;
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
            // console.log(result);
            // console.log(error);
            if (result) {
              handleSubmit(result?.text);
            }

            // if (error) {
            //   console.info(error);
            // }

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
