import { useEffect, useState } from "react";
import { CoffeePaymentData } from "./coffee-modal";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input, Modal, Skeleton } from "@mui/material";
import { toast } from "react-toastify";

import API from "../../../api";
import Image from "next/image";
import { TShirtSize } from "./coffee-step-2";

function CoffeeStep3({data}: {data: CoffeePaymentData}) {
  const calcValuePayment = () => {
    let value: number = data.price;
    if (value === 0) {
      for (const sale of data.sale) {
        value += sale.price;
      }
    }

    if (data.withSocialBenefit){
      return value / 2;
    }
    
    return value;
  }


  const valuePayment:any = calcValuePayment();
  const namePayment: string = data.sale?.map((sale) => sale.name).join(", ");

  const [qrCodeBase64, setqrCodeBase64] = useState("");
  const [qrCodeCopyPaste, setqrCodeCopyPaste] = useState("");
  const [loading, setLoading] = useState(true);

  async function getPayment() {
    try {
      if(!data['id']){
        let fileName: string = null;
        if (data.socialBenefitFile) {
          const { data: uploadResponse } = await API.upload.single(data.socialBenefitFile);
          fileName = uploadResponse.fileName;
        }

        if (data.tShirtSize) {
          data.tShirtSize = TShirtSize[data.tShirtSize.split(' ')[0]];
        }

        const { data: paymentResponse } = await API.coffee.createPayment(
          data.withSocialBenefit,
          fileName,
          data.tShirtSize === '' ? TShirtSize.NONE : (data.tShirtSize as TShirtSize),
          data.foodOption,
          data.sale.map((sale) => sale.id)
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
    } finally {
      setLoading(false);
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
      { loading && (!qrCodeBase64 || !qrCodeCopyPaste) &&
        <div className="flex flex-col md:grid md:gap-4 md:grid-cols-2">
          <Skeleton variant="rectangular" width={250} height={250} />
          <Skeleton variant="rectangular" width={250} height={250} />
        </div>
      }

      { !loading ?
        ( qrCodeBase64 && qrCodeCopyPaste ? (
          <div className="flex flex-col md:grid md:gap-4 md:grid-cols-2">
            <section
              className="m-4 flex justify-center items-center flex-col"
              style={{ flexDirection: "column" }}
            >
              <p>Escaneie o QR Code abaixo ou copie e cole o código do PIX</p>
              <b>Compras: { namePayment }</b>
              <b className="py-3">Valor: R${ valuePayment }</b>
              <p>Caso seu QR code não tenha carregado, verifique se seu e-mail está correto!</p>
              <p>
                Após realizar o pagamento, atualize a página. Você possui <b>2 horas</b> para realizá-lo.
              </p>
              <p>Pode ser que demore um tempo até o pagamento ser confirmado.</p>
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
          ) : (
            <p>Algo deu errado, tente novamente!</p>
          )
        ) : (
          <></>
        )}
    </div>
  );
}

export default CoffeeStep3;
