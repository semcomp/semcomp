import { useState } from "react";
import QRCode from "react-qr-code";

interface ProfilePageProps {
  name?: string;
  code?: string;
  qrValue?: string;
  event?: string;
}

export default function ProfilePage({
  name = "João Gabriel Pieroli da Silva",
  code = "011235",
  qrValue = "Um código QR genérico para teste",
  event = "SEMCOMP"
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "account">("qr");
  const [userName, setUserName] = useState(name);
  const [userCode, setUserCode] = useState(code);
  const [qrData, setQrData] = useState(qrValue);

  const initials = userName
    .split(" ")
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background items-center">
      <div className="bg-card border border-border rounded-2xl w-full max-w-85 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        <div className="flex bg-muted/30 rounded-full m-3 p-1 gap-1 border border-border/50">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 text-center py-2 rounded-full text-sm transition-all duration-200 ${
              activeTab === "qr" 
                ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 text-center py-2 rounded-full text-sm transition-all duration-200 ${
              activeTab === "account" 
                ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Minha Conta
          </button>
        </div>

        {activeTab === "qr" && (
          <div className="px-6 pb-8 pt-2 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">Meu QR Code</h1>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Utilize seu QR durante a <span className="text-semcomp-400 font-semibold">{event}</span> para registrar sua presença
            </p>
            <div className="relative p-4 mb-4">
              <div className="absolute top-0 right-0 w-10 h-10 border-r-15 border-t-15 border-semcompMidLightBlue" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-l-15 border-b-15 border-semcompMidLightBlue" />
              
              <div className="bg-semcompOffWhite p-4 -m-2">
                <QRCode value={qrData} size={180} fgColor="#0B2639" bgColor="transparent" />
              </div>
            </div>

            <p className="text-center font-medium text-foreground mb-6">{userName}</p>

            <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between gap-4 w-full border border-border/50">
              <p className="text-xs text-muted-foreground leading-tight max-w-35">
                Caso dê algum problema ao scannear, forneça o código:
              </p>
              <p className="text-xl font-bold text-foreground tracking-[0.2em] whitespace-nowrap">
                {userCode}
              </p>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="px-6 pb-8 pt-4 flex flex-col">
            <div className="w-16 h-16 rounded-full bg-semcomp-500 flex items-center justify-center mx-auto mb-3 shadow-lg ring-2 ring-semcomp-500/20">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
            <h2 className="text-center text-lg font-bold text-foreground mb-6">{userName}</h2>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Código</span>
                <span className="text-sm font-semibold text-foreground">{userCode}</span>
              </div>
            </div>

            <button className="mt-6 w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-sm font-medium transition-colors border border-border">
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}