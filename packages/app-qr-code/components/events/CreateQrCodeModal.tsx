import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import SemcompApi from "../../api/semcomp-api";
import { SemcompApiEvent } from "../../models/SemcompApiModels";

function CreateQrCodeModal({
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

  const [qrCode, setQrCode] = useState();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setQrCode(await semcompApi.generateQrCode(data.id));
      } catch (e) {
        toast.error('Erro ao cadastrar presença');
        console.error(e);
      }
    }, 5000);
  }, []);

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        {data.name}
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <QRCodeSVG value={qrCode} />
      </div>
      <div className="w-full px-6">
        <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default CreateQrCodeModal;
