import { useState } from "react";
import QRCode from "react-qr-code";


export default function ProfilePage() {
  const [text, setText] = useState("Hello QR");

  return (
    <div style={{ padding: 20 }}>
      <h1>Perfil</h1>
      <h2>Gerar QR Code</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: 16, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: 16 }}>
        <QRCode value={text} />
      </div>
    </div>
  );
}