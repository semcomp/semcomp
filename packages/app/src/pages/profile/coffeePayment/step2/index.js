import React, { useEffect, useState } from "react";
import API from "../../../../api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Input } from "@mui/material";
import { toast } from "react-toastify";

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
    <div>
      <h1>Passo 2 do coffee</h1>
      {!qrCodeBase64 || !qrCodeCopyPaste ? (
        <p>Loading...</p>
      ) : (
        <div>
          <section>
            <img
              style={{ height: "200px", width: "200px" }}
              src={`data:image/png;base64, ${qrCodeBase64}`}
              alt="QRcode"
            />
          </section>
          <section>
            <Input
              readOnly
              aria-readonly
              label="QR Code"
              defaultValue={qrCodeCopyPaste}
              variant="standard"
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
      )}
    </div>
  );
}

export default CoffeeStep2;
