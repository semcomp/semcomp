import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import exportToCsv from '../../libs/DownloadCsv';

function DownloadSubscriptions({ eventId, eventName }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  async function fetchDownloadData(data) {
    try {
      setIsLoading(true);
      const response = await semcompApi.getSubscriptionsUsers(eventId);
      if(response.length > 0){
        exportToCsv(response, eventName);
      }else{
        toast.error("Não há inscritos para esse evento ainda!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
       <button
          className="w-full bg-black text-white py-3 px-6 my-2"
          type='button'
          onClick={fetchDownloadData}
        >
          Baixar lista de inscritos
        </button>
    </>
  );
}

export default DownloadSubscriptions;
