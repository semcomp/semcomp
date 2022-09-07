import { useEffect, useState } from "react";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input, Skeleton } from "@mui/material";
import { toast } from "react-toastify";

import API from "../../../api";
import { CoffeePaymentData } from "./coffee-step-2";

function CoffeeStep3({data}: {data: CoffeePaymentData}) {
  const [qrCodeBase64, setqrCodeBase64] = useState("");
  const [qrCodeCopyPaste, setqrCodeCopyPaste] = useState("");

  async function getPayment() {
    try {
      let fileName: string = null;
      if (data.socialBenefitFile) {
        const { data: uploadResponse } = await API.upload.single(data.socialBenefitFile);
        fileName = uploadResponse.fileName;
      }
      const { data: paymentResponse } = await API.coffee.createPayment(
        data.withSocialBenefit, fileName, data.tShirtSize
      );
      setqrCodeBase64(paymentResponse.qrCodeBase64);
      setqrCodeCopyPaste(paymentResponse.qrCode);
    } catch (error) {
      toast.error(error?.data?.message[0]);
      console.error(error);
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
    <div className="step2-container">
      {!qrCodeBase64 || !qrCodeCopyPaste ? (
        <div className="loading-skeleton">
          <Skeleton variant="rectangular" width={250} height={250} />
          <Skeleton variant="rectangular" width={250} height={250} />
        </div>
      ) : (
        <div className="QRCode-payment">
          <section
            className="QRCode-instructions"
            style={{ flexDirection: "column" }}
          >
            <p>Escaneie o QR Code abaixo ou copie e cole o código do PIX</p>
            <b className="py-3">Valor: R${data.withSocialBenefit ? "32.50" : "65.00"}</b>
            <p>
              Depois de realizar o pagamento no seu banco, clique em fechar e
              atualize a página.
            </p>
            <p>Pode ser que demore um tempo para o pagamento ser realizado.</p>
          </section>
          <div>
            <section className="QRCode-methods">
              <img
                style={{ height: "200px", width: "200px" }}
                src={`data:image/png;base64, ${qrCodeBase64}`}
                alt="QRcode"
              />
              <section className="QRCode-copy-paste">
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
