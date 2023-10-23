import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import LoadingButton from "../reusable/LoadingButton";
import { useRouter } from 'next/router';
import Input, { InputType } from "../Input";
import exportToCsv from '../../libs/DownloadCsv';

function DownloadSubscriptions({ eventId }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  async function fetchDownloadData(data) {
    try {
      setIsLoading(true);
      console.log(eventId);
    //   const response = await semcompApi.getSubscriptionsUsers(data.id);
      // exportToCsv(mapData(response.getEntities()));

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
       <button
          className="w-full bg-black text-white py-3 px-6"
          type='button'
          onClick={fetchDownloadData}
        >
          Baixar Planilha
        </button>
    </>
  );
}

export default DownloadSubscriptions;
