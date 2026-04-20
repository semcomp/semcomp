import { BannerCard } from "@/components/BannerCard";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface QRCodeReaderLocationState {
  eventName?: string;
  datetime?: string;
}

export default function QRCodeReader() {
  const navigate = useNavigate();
  const { nameEvent, datetime } = useParams();
  const location = useLocation();
  const state = location.state as QRCodeReaderLocationState | null;

  const resolvedEventName = state?.eventName ?? (nameEvent ? decodeURIComponent(nameEvent) : "evento selecionado");
  const resolvedDateTime = state?.datetime ?? (datetime ? decodeURIComponent(datetime) : "");
  const eventKey = resolvedEventName && resolvedDateTime ? `${resolvedEventName} + ${resolvedDateTime}` : "Sem chave composta";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        label="Presença"
        title={`QR Code Reader de ${resolvedEventName}`}
        description={`Tela preparada para coleta de presença do evento ${eventKey}. A implementação do scanner será adicionada futuramente.`}
        onBack={() => navigate("/events")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Fluxo de coleta de presença</h2>
          <p className="text-sm text-muted-foreground">
            Esta página já recebe o evento correto. Quando o leitor de QR Code for implementado,
            ele pode usar este contexto para validar a presença do participante nesse evento.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Evento</p>
            <p className="mt-1 text-sm font-medium text-foreground">{resolvedEventName}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chave composta</p>
            <p className="mt-1 text-sm font-medium text-foreground">{eventKey}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/events")} variant="ghost" className="text-muted-foreground">
            Voltar para eventos
          </Button>
          <Button disabled className="bg-primary/70 text-foreground">
            Scanner em breve
          </Button>
        </div>
      </div>
    </section>
  );
}
