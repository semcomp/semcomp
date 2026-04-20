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
  qrValue = "011235",
  event = "SEMCOMP",
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "account">("qr");

  const initials = name
    .split(" ")
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formattedCode = code.split("").join(" ");

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background items-center">
      <div className="bg-card border border-border rounded-2xl w-full max-w-[340px] overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        
        {/* Tabs - Usando a cor semcomp-900 para o fundo do wrapper das abas */}
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

        {/* QR Code Tab */}
        {activeTab === "qr" && (
          <div className="px-6 pb-8 pt-2 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-foreground mb-1">Meu QR Code</h1>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              Utilize seu QR durante a <span className="text-semcomp-400 font-semibold">{event}</span> para registrar sua presença
            </p>

            {/* QR Frame with corners */}
            <div className="relative p-4 mb-4">
              {/* Corner superior direito */}
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-semcomp-500 rounded-tr-xl" />
              {/* Corner inferior esquerdo */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-semcomp-500 rounded-bl-xl" />
              
              <div className="bg-white p-4 rounded-xl shadow-inner">
                <QRCode value={qrValue} size={180} fgColor="#0B2639" />
              </div>
            </div>

            <p className="text-center font-medium text-foreground mb-6">{name}</p>

            <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between gap-4 w-full border border-border/50">
              <p className="text-xs text-muted-foreground leading-tight max-w-[140px]">
                Caso dê algum problema ao scannear, forneça o código:
              </p>
              <p className="text-xl font-bold text-foreground tracking-[0.2em] whitespace-nowrap">
                {formattedCode}
              </p>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="px-6 pb-8 pt-4 flex flex-col">
            <div className="w-16 h-16 rounded-full bg-semcomp-500 flex items-center justify-center mx-auto mb-3 shadow-lg ring-2 ring-semcomp-500/20">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <h2 className="text-center text-lg font-bold text-foreground mb-6">{name}</h2>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Código</span>
                <span className="text-sm font-semibold text-foreground">{code}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Evento</span>
                <span className="text-sm font-semibold text-foreground">{event}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-bold text-emerald-500">Ativo</span>
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