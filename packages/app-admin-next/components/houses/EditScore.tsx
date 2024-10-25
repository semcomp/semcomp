import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import LoadingButton from "../reusable/LoadingButton";
import { useRouter } from 'next/router';
import Input, { InputType } from "../Input";

function EditScore({ eventId }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function handleScoreChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setScore(Number(value));
  }

  async function handleSubmit(){
    try {
        setIsLoading(true);
        await semcompApi.addPoints(eventId, score);
        toast.success('Pontuação editada com sucesso');
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setInterval(() =>{
            router.reload();
        }, 2000)
      }
  }

  return (
    <>
        <Input
            className="my-3"
            label="Alterar Pontos"
            value={score}
            onChange={handleScoreChange}
            type={InputType.Number}
        />
        <LoadingButton
          className="w-full bg-black text-white py-3 px-6"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Alterar pontos
        </LoadingButton>
    </>
  );
}

export default EditScore;
