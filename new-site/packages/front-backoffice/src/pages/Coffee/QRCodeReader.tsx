import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Coffee, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { BannerCard } from "@/components/BannerCard";
import { Card } from "@/components/ui/card";
import QRCodeScanner from "@/components/QRCodeScanner";
import { coffeeAPI } from "@/api/coffee";

type Result =
  | { kind: "ok"; userNumber: string }
  | { kind: "denied"; userNumber: string }
  | { kind: "error"; message: string };

/**
 * Extrai o número do usuário do conteúdo do QR.
 * Aceita "123" ou um JSON com user_number / userNumber.
 * AJUSTE aqui se o QR do participante tiver outro formato.
 */
function parseUserNumber(raw: string): string | null {
  const value = raw.trim();
  if (/^\d+$/.test(value)) return value;
  try {
    const parsed = JSON.parse(value);
    const n = parsed.user_number ?? parsed.userNumber;
    if (n !== undefined && /^\d+$/.test(String(n))) return String(n);
  } catch {
    /* não é JSON */
  }
  return null;
}

export default function CoffeeQRCodeReader() {
  const navigate = useNavigate();
  const { datetime } = useParams<{ datetime: string }>();
  const location = useLocation();
  const coffeeName =
    (location.state as { coffeeName?: string } | null)?.coffeeName ?? "Coffee";

  const [result, setResult] = useState<Result | null>(null);

  const handleScan = async (scannedData: string) => {
    const userNumber = parseUserNumber(scannedData);
    if (!userNumber) {
      setResult({ kind: "error", message: "QR Code inválido." });
      return;
    }
    if (!datetime) {
      setResult({ kind: "error", message: "Horário do coffee não informado." });
      return;
    }

    try {
      const { hasCoffee } = await coffeeAPI.validateCoffee(userNumber, datetime);
      setResult({ kind: hasCoffee ? "ok" : "denied", userNumber });
    } catch (err: any) {
      const status = err?.response?.status;
      const message =
        status === 404
          ? "Nenhum coffee cadastrado para este horário."
          : status === 403
          ? "Você não tem permissão para validar coffees."
          : err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Erro ao verificar o coffee.";
      setResult({ kind: "error", message });
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={<Coffee />}
        iconClassName="text-amber-400"
        label="Coffee Break"
        title={`Validar: ${coffeeName}`}
        description="Escaneie o QR Code do participante para verificar se ele possui compra paga deste coffee."
        onBack={() => navigate("/coffee")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-amber-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-amber-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {result && (
        <Card
          className={`rounded-2xl border p-5 flex items-center gap-4 ${
            result.kind === "ok"
              ? "border-emerald-500 bg-emerald-950/30"
              : result.kind === "denied"
              ? "border-red-500 bg-red-950/30"
              : "border-amber-500 bg-amber-950/30"
          }`}
        >
          {result.kind === "ok" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Acesso liberado
                </p>
                <p className="text-sm text-muted-foreground">
                  Usuário nº {result.userNumber} possui este coffee.
                </p>
              </div>
            </>
          )}
          {result.kind === "denied" && (
            <>
              <XCircle className="h-10 w-10 text-red-400 shrink-0" />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Sem acesso
                </p>
                <p className="text-sm text-muted-foreground">
                  Usuário nº {result.userNumber} não possui compra paga deste
                  coffee.
                </p>
              </div>
            </>
          )}
          {result.kind === "error" && (
            <>
              <AlertTriangle className="h-10 w-10 text-amber-400 shrink-0" />
              <div>
                <p className="text-lg font-semibold text-foreground">Erro</p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
              </div>
            </>
          )}
        </Card>
      )}

      <QRCodeScanner
        onScan={handleScan}
        onStart={() => setResult(null)}
        title="Leitor de QR Code do Coffee"
        description="Clique em “Iniciar leitura” para escanear cada participante."
        frameColor="amber"
        />
    </section>
  );
}