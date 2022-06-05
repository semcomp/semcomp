import React, { useEffect, useState } from "react";
import API from "../../../../api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input, Skeleton } from "@mui/material";
import { toast } from "react-toastify";

import "./styles.css";

function CoffeeStep2() {
  const [qrCodeBase64, setqrCodeBase64] = useState("");
  const [qrCodeCopyPaste, setqrCodeCopyPaste] = useState("");

  useEffect(() => {
    async function getPayment() {
      try {
        const response = await API.coffee.createPayment();
        console.log(response.data);
        setqrCodeBase64(response.data.qrCodeBase64);
        setqrCodeCopyPaste(response.data.qrCode);
      } catch (e) {
        console.error(e);
      }
    }

    getPayment();
  }, []);

  function copyToClipboard() {
    navigator.clipboard.writeText(qrCodeCopyPaste);
    toast.success("Copiado!");
  }

  return (
    <div className="step2-container">
      {!qrCodeBase64 || !qrCodeCopyPaste ? (
        <div>
          <Skeleton variant="rectangular" width={250} height={250} />
        </div>
      ) : (
        <div className="QRCode-payment">
          <section
            className="QRCode-instructions"
            style={{ flexDirection: "column" }}
          >
            <p>Escaneie o QR Code abaixo ou copie e cole o código do PIX</p>
            <b>Valor: R$15,00</b>
          </section>
          <div>
            <section className="QRCode-methods">
              <img
                style={{ height: "200px", width: "200px" }}
                src={`data:image/png;base64, ${qrCodeBase64}`}
                alt="QRcode"
              />
            </section>
            <section className="QRCode-methods">
              <Input
                readOnly
                aria-readonly
                label="QR Code"
                defaultValue={qrCodeCopyPaste}
                variant="standard"
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
          </div>
        </div>
      )}
    </div>
  );
}

export default CoffeeStep2;
