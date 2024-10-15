import { useState } from "react";
import { toast } from "react-toastify";

import GameConfigForm, { GameConfigFormData } from "./GameConfigForm";
import { useAppContext } from "../../libs/contextLib";
import LoadingButton from "../reusable/LoadingButton";
import SemcompApi from "../../api/semcomp-api";
import Modal from "../Modal";

function EditGameConfigModal({
    data,
    setData,
    onRequestClose,
}: {
    data?: GameConfigFormData;
    setData: (data: GameConfigFormData) => void;
    onRequestClose: any;
}) {
    const {
        semcompApi
    }: {
        semcompApi: SemcompApi
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit() {
        if (!data.game) return toast.error('Você deve fornecer um jogo');
        if (data.hasGroups && data.maximumNumberOfMembersInGroup <= 0) return toast.error('Você deve fornecer uma quantidade de membros válida');
        if (data.startDate >= data.endDate) return toast.error('A data de início não pode ser maior ou igual que a data de término');

        if (!data.hasGroups) {
            data.maximumNumberOfMembersInGroup = 0;
        }
        data.eventPrefix = data.game;

        try {
            setIsLoading(true);
            await semcompApi.editGameConfig(data.id, data);
            toast.success('Configuração de jogo criada com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro no servidor!');
        } finally {
            setIsLoading(false);
            onRequestClose();
        }
    }

    return (
        <Modal onRequestClose={onRequestClose}>
            <div
                className="w-full bg-black text-white text-center text-xl font-bold p-6"
            >
                 Editar configuração de jogo
            </div>
            <div className="max-h-96 overflow-y-scroll p-6 w-full">
                <GameConfigForm
                    data={data}
                    setData={setData}
                ></GameConfigForm>
            </div>
            <div className="w-full px-6">
                <LoadingButton
                    isLoading={isLoading}
                    className="w-full text-white py-3 px-6"
                    onClick={handleSubmit}
                >
                    Enviar
                </LoadingButton>
                <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
                    Fechar
                </button>
            </div>
        </Modal>
    );
}

export default EditGameConfigModal;