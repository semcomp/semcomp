  import { BannerCard } from "@/components/BannerCard";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { CheckCircle2, Camera, RefreshCw, ScanLine, Square } from "lucide-react";
  import QrScanner from "qr-scanner";
  import { useEffect, useRef, useState } from "react";
  import { useLocation, useNavigate, useParams } from "react-router-dom";
  import { presenceAPI } from "@/api/presence.ts"
  import { useNotification } from "@/contexts/NotificationContext"; 

  QrScanner.WORKER_PATH = new URL("qr-scanner/qr-scanner-worker.min.js", import.meta.url).toString();

  interface QRCodeReaderLocationState {
    eventName?: string;
    datetime?: string;
  }

  export default function QRCodeReader() {
    const navigate = useNavigate();
    const { nameEvent, datetime } = useParams();
    const location = useLocation();
    const state = location.state as QRCodeReaderLocationState | null;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    const [isStarting, setIsStarting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const { showNotification } = useNotification();

    const resolvedEventName = state?.eventName ?? (nameEvent ? decodeURIComponent(nameEvent) : "evento selecionado");
    const resolvedDateTime = state?.datetime ?? (datetime ? decodeURIComponent(datetime) : "");
    const eventKey = resolvedEventName && resolvedDateTime ? `${resolvedEventName} + ${resolvedDateTime}` : "Sem chave composta";

    useEffect(() => {
      if (error !== null) {
        // Verifica se o erro realmente existe para gerar a notificação
        showNotification(error as string, "warning");
      }
    }, [error]);

    const registerPresence = async (userNumber: string) => {
      try {
        setError("");
        
        await presenceAPI.createByQRCode(
          userNumber,
          resolvedEventName,
          resolvedDateTime,
          "admin@semcomp.com"
        );

        setResult(userNumber);

        setShowSuccessPopup(true);

      } catch (err: any) {
        console.error(err);
        setShowSuccessPopup(false);

        setError("Erro ao registrar presença");
      }
    };

    const stopScanner = () => {
      scannerRef.current?.stop();
      setIsScanning(false);
    };

    const startScanner = async () => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const handleDecode = async (
        scanResult: QrScanner.ScanResult
      ) => {
        const userNumber = scanResult.data.trim();

        if (!userNumber) {
          return;
        }

        console.log("QR lido:", userNumber);

        scannerRef.current?.pause(true);
        setIsScanning(false);

        await registerPresence(userNumber);
      };

      try {
        setIsStarting(true);
        setError("");

        videoElement.setAttribute("playsinline", "true");
        videoElement.muted = true;

        if (!scannerRef.current) {
          scannerRef.current = new QrScanner(videoElement, handleDecode, {
            preferredCamera: "environment",
            maxScansPerSecond: 30,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            calculateScanRegion: (video: HTMLVideoElement) => {
              const size = Math.round(Math.min(video.videoWidth, video.videoHeight) * 0.62);
              return {
                x: Math.round((video.videoWidth - size) / 2),
                y: Math.round((video.videoHeight - size) / 2),
                width: size,
                height: size,
                downScaledWidth: 240,
                downScaledHeight: 240,
              };
            },
            onDecodeError: (scanError: string | Error) => {
              if (scanError !== QrScanner.NO_QR_CODE_FOUND) {
                console.error("Erro no scan:", scanError);
              }
            },
          });
        }

        await scannerRef.current.start();
        scannerRef.current.setInversionMode("both");
        setIsScanning(true);
      } catch (scanError) {
        console.error("Erro ao iniciar câmera:", scanError);
        setError("Nao foi possivel iniciar a camera. Tente usar HTTPS e liberar permissao.");
      } finally {
        setIsStarting(false);
      }
    };

    const scanAgain = async () => {
      setShowSuccessPopup(false);
      setResult("");
      setError("");

      try {
        setIsStarting(true);
        await scannerRef.current?.start();
        setIsScanning(true);
      } catch (scanError) {
        console.error("Erro ao reiniciar scanner:", scanError);
        setError("Nao foi possivel reiniciar o scanner.");
      } finally {
        setIsStarting(false);
      }
    };

    useEffect(() => {
      return () => {
        scannerRef.current?.destroy();
      };
    }, []);

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

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">Leitura</p>
                <h2 className="mt-1 text-lg md:text-xl font-semibold text-foreground">Scanner de QR Code</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aponte a câmera para o QR Code dentro da moldura para registrar a presença.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                <Camera className="h-3.5 w-3.5" />
                {isScanning ? "Câmera ativa" : "Câmera parada"}
              </div>
            </div>

            <div className="relative mx-auto aspect-3/4 sm:aspect-square lg:aspect-4/3 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/25" />

              <div className="pointer-events-none absolute left-1/2 top-1/2 w-[78%] max-w-88 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border-4 border-emerald-400/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.36)] lg:max-w-100">
                <div className="absolute inset-3 rounded-[1.25rem] border border-white/20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
                <div className="absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_50%,transparent_100%)] opacity-30" />

                <div className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-emerald-300" />
                <div className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-emerald-300" />
                <div className="absolute -left-1 -bottom-1 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-emerald-300" />
                <div className="absolute -right-1 -bottom-1 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-emerald-300" />

                <div className="absolute inset-x-6 top-6 h-px bg-linear-to-r from-transparent via-emerald-200/80 to-transparent" />
                <div className="absolute inset-x-6 bottom-6 h-px bg-linear-to-r from-transparent via-emerald-200/80 to-transparent" />
                <div className="absolute inset-y-6 left-6 w-px bg-linear-to-b from-transparent via-emerald-200/80 to-transparent" />
                <div className="absolute inset-y-6 right-6 w-px bg-linear-to-b from-transparent via-emerald-200/80 to-transparent" />

                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]" />
              </div>

              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm md:left-1/2 md:right-auto md:bottom-5 md:w-fit md:-translate-x-1/2">
                Centralize o QR dentro da moldura verde para escanear.
              </div>
            </div>

            {isStarting && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ScanLine className="h-4 w-4 animate-pulse" />
                Iniciando câmera...
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-3">
              {!isScanning && !showSuccessPopup && (
                <Button onClick={startScanner} className="gap-2 bg-primary hover:bg-primary/90 text-foreground">
                  <ScanLine className="h-4 w-4" />
                  Iniciar leitura
                </Button>
              )}

              {isScanning && (
                <Button onClick={stopScanner} variant="secondary" className="gap-2">
                  <Square className="h-4 w-4" />
                  Parar leitura
                </Button>
              )}

              <Button onClick={() => navigate("/events")} variant="ghost" className="text-muted-foreground">
                Voltar para eventos
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">Contexto</p>
              <h3 className="text-lg font-semibold text-foreground">Evento alvo</h3>
              <p className="text-sm text-muted-foreground">
                O leitor já recebe a chave composta do evento selecionado na tela anterior.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Evento</p>
                <p className="mt-1 text-sm font-medium text-foreground">{resolvedEventName}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Data e hora</p>
                <p className="mt-1 text-sm font-medium text-foreground">{resolvedDateTime || "Sem data"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chave composta</p>
                <p className="mt-1 text-sm font-medium text-foreground wrap-break-word">{eventKey}</p>
              </div>
            </div>

          </Card>
        </div>

        {showSuccessPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <Card className="w-full lg:w-1/3 overflow-hidden rounded-2xl border border-muted bg-popover p-6 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                {/* Ícone com fundo sutil para destaque */}
                <div className="shrink-0 rounded-full bg-emerald-500/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    QR Code lido com sucesso
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Presença registrada com sucesso.
                    </p>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                        Presença lida
                      </p>

                      <p className="mt-1 font-mono text-lg font-semibold text-emerald-300">
                        {result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button 
                  onClick={() => setShowSuccessPopup(false)} 
                  variant="outline" 
                  className="w-full sm:w-auto border-muted-foreground/20 hover:bg-muted"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={scanAgain} 
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                >
                  <RefreshCw className="h-4 w-4" />
                  Escanear novamente
                </Button>
              </div>
            </Card>
          </div>
        )}
      </section>
    );
  }
