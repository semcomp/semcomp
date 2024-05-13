import { useEffect, useState } from "react";
import { CoffeePaymentData } from "./coffee-modal";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input, Modal, Skeleton } from "@mui/material";
import { toast } from "react-toastify";

import API from "../../../api";
import Image from "next/image";
import { KitOption } from "./coffee-step-1";
import { TShirtSize } from "./coffee-step-2";

function CoffeeStep3({data}: {data: CoffeePaymentData}) {

  const calcValuePayment = (kitOptions) => {
    let value: any;
    
    if(kitOptions == "Kit") {
      value = 18;
    } else if (kitOptions == "Kit e Coffee"){
      value = 18;
    } else if (kitOptions == "Coffee"){
      value = 18;
    } else {
      value = "Nenhuma opção selecionada";
    }
    if(data.withSocialBenefit){
      return value/2;
    }
    
    return value;
  }

  let valuePayment:any = calcValuePayment(data.kitOption);

  if (valuePayment != "Nenhuma opção selecionada"){
    data.withSocialBenefit ?? (valuePayment = valuePayment/2)
  }

  const [qrCodeBase64, setqrCodeBase64] = useState("");
  const [qrCodeCopyPaste, setqrCodeCopyPaste] = useState("");
  
  async function getPayment() {
    try {
      if(!data['id']){
        let fileName: string = null;
        if (data.socialBenefitFile) {
          const { data: uploadResponse } = await API.upload.single(data.socialBenefitFile);
          fileName = uploadResponse.fileName;
        }

        // if(data.kitOption === KitOption.COFFEE){
        //   data.tShirtSize = TShirtSize.NONE;
        // }

        const { data: paymentResponse } = await API.coffee.createPayment(
          data.withSocialBenefit, fileName, data.tShirtSize, data.foodOption, data.kitOption
        );
        setqrCodeBase64(paymentResponse.qrCodeBase64);
        setqrCodeCopyPaste(paymentResponse.qrCode);
      } else {
        setqrCodeBase64(data['qrCodeBase64']);
        setqrCodeCopyPaste(data['qrCode']);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message[0]);
    }
  }

  useEffect(() => {
    getPayment();
  }, []);

  function copyToClipboard() {
    navigator.clipboard.writeText(qrCodeCopyPaste);
    toast.success("Copiado!");
  }

  return (
    <div className="m-2 flex justify-center items-center flex-col">
      {!qrCodeBase64 || !qrCodeCopyPaste ? (
        <div className="flex flex-col md:grid md:gap-4 md:grid-cols-2">
          <Skeleton variant="rectangular" width={250} height={250} />
          <Skeleton variant="rectangular" width={250} height={250} />
        </div>
      ) : (
        <div className="flex flex-col md:grid md:gap-4 md:grid-cols-2">
          <section
            className="m-4 flex justify-center items-center flex-col"
            style={{ flexDirection: "column" }}
          >
            <p>Escaneie o QR Code abaixo ou copie e cole o código do PIX</p>
            <b className="py-3">Valor: R${ valuePayment }</b>
            <p>Caso seu QR code não carregou, verifique se seu e-mail está correto!</p>
            <p>
              Depois de realizar o pagamento no seu banco, clique em fechar e
              atualize a página.
            </p>
            <p>Pode ser que demore um tempo para o pagamento ser realizado.</p>
          </section>
          <div>
            <section className="m-4 flex justify-center items-center flex-col">
              <div className="hidden md:flex">
                <Image
                  height={200}
                  width={200}
                  src={`data:image/png;base64, ${qrCodeBase64}`}
                  alt="QRcode"
                />
              </div>
              <section className="mt-4 flex flex-col content-center">
                <Input
                  readOnly
                  aria-readonly
                  defaultValue={qrCodeCopyPaste}
                  style={{ marginRight: "10px" }}
                />
                <Button
                  onClick={() => copyToClipboard()}
                  variant="contained"
                  endIcon={<ContentCopyIcon />}
                >
                  Copiar
                </Button>
              </section>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoffeeStep3;
