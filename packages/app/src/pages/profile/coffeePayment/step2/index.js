import React, { useEffect, useState } from "react";
import API from "../../../../api";

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
            <input style={{ width: "200px" }} value={qrCodeCopyPaste} />
            <button
              onClick={() => navigator.clipboard.writeText(qrCodeCopyPaste)}
            >
              Copiar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default CoffeeStep2;
