import React, { useEffect, useState } from "react";
import API from "../../../../api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input, Skeleton } from "@mui/material";
import { toast } from "react-toastify";

import "./styles.css";

function CoffeeStep2() {
  // const [userPaid, setUserPaid] = useState(false);
  const [qrCodeBase64, setqrCodeBase64] = useState("");
  const [qrCodeCopyPaste, setqrCodeCopyPaste] = useState("");

  useEffect(() => {
    async function getPayment() {
      try {
        const { data } = await API.coffee.createPayment();
        console.log(data);
        setqrCodeBase64(data.qrCodeBase64);
        setqrCodeCopyPaste(data.qrCode);
      } catch (e) {
        console.error(e);
      }
    }

    getPayment();
  }, []);

  // useEffect(() => {
  //   async function getUserData() {
  //     try {
  //       const { data } = await API.auth.me();
  //       console.log(data);
  //       setUserPaid(data.paid);
  //       console.log(userPaid);
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   }

  //   getUserData();
  // }, [userPaid]);

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
            <b style={{ marginBottom: "1rem" }}>Valor: R$15,00</b>
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
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoffeeStep2;
