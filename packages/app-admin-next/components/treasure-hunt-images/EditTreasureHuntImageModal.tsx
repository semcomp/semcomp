import { useState } from "react";

import { toast } from "react-toastify";
import QRCode from "qrcode.react";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import TreasureHuntImageForm from "./TreasureHuntImageForm";

function EditTreasureHuntImageModal({ initialValue, onRequestClose }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    try {
      setIsLoading(true);
      await semcompApi.editTreasureHuntImage(data.id, data);
      toast.success('Dica do Caça ao Tesouro editada com sucesso');
      onRequestClose()
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setIsLoading(true);
      await semcompApi.deleteTreasureHuntImage(data.id);
      toast.success('Dica do Caça ao Tesouro deletada com sucesso');
      onRequestClose()
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownloadQRCode() {
    const canvas = document.getElementById(data.id) as HTMLCanvasElement;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = data.id + " - " + data.place + ".png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
         Editar Imagem Caça ao Tesouro
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <TreasureHuntImageForm initialData={initialValue} onDataChange={setData}></TreasureHuntImageForm>
      </div>
      <div className="w-full px-6">
        <div className="flex flex-row align-center justify-center">
            <button
            className="w-[100px] bg-green-500 text-white py-3 px-6 mb-1 mx-2"
            onClick={handleSubmit}
            >
            Enviar
            </button>
            <button
            className="w-[100px] bg-red-500 text-white py-3 px-6 mb-1 mx-2"
            onClick={handleDelete}
            >
            Deletar
            </button>
        </div>
        <QRCode
            className="hidden"
            id={data.id}
            value={`http://semcomp.icmc.usp.br/treasure-hunt?id=${data.id}`}
            size={290}
            level={"H"}
            includeMargin={true}
        />
        <button className="w-full bg-blue-500 text-white py-3 px-6 mb-1 mt-6" type="button" onClick={handleDownloadQRCode}>
          Download QRCode
        </button>
        <button className="w-full bg-red-500 text-white py-3 px-6 mb-6 mt-1" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default EditTreasureHuntImageModal;
