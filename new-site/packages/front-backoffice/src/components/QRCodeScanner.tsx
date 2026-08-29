import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, ScanLine, Square } from "lucide-react";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

QrScanner.WORKER_PATH = new URL(
  "qr-scanner/qr-scanner-worker.min.js",
  import.meta.url
).toString();

interface QRCodeScannerProps {
  onScan: (scannedData: string) => Promise<void> | void;
  title?: string;
  description?: string;
  frameColor?: "emerald" | "amber";
}

export default function QRCodeScanner({
  onScan,
  title = "Scanner de QR Code",
  description = "Aponte a câmera para o QR Code dentro da moldura.",
  frameColor = "emerald",
}: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAmber = frameColor === "amber";
  const borderClass = isAmber ? "border-amber-400/95" : "border-emerald-400/95";
  const cornerClass = isAmber ? "border-amber-300" : "border-emerald-300";

  const stopScanner = () => {
    scannerRef.current?.stop();
    setIsScanning(false);
  };

  const startScanner = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleDecode = async (scanResult: QrScanner.ScanResult) => {
      const value = scanResult.data.trim();
      if (!value) return;

      scannerRef.current?.pause(true);
      setIsScanning(false);
      await onScan(value);
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
            const size = Math.round(
              Math.min(video.videoWidth, video.videoHeight) * 0.62
            );
            return {
              x: Math.round((video.videoWidth - size) / 2),
              y: Math.round((video.videoHeight - size) / 2),
              width: size,
              height: size,
              downScaledWidth: 240,
              downScaledHeight: 240,
            };
          },
        });
      }

      await scannerRef.current.start();
      scannerRef.current.setInversionMode("both");
      setIsScanning(true);
    } catch (scanError) {
      console.error("Erro ao iniciar câmera:", scanError);
      setError(
        "Não foi possível iniciar a câmera. Tente usar HTTPS e liberar permissão."
      );
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
    <Card className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
            Leitura
          </p>
          <h2 className="mt-1 text-lg md:text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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

        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 w-[78%] max-w-88 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border-4 ${borderClass} shadow-[0_0_0_9999px_rgba(0,0,0,0.36)] lg:max-w-100`}
        >
          <div className="absolute inset-3 rounded-[1.25rem] border border-white/20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
          <div
            className={`absolute -left-1 -top-1 h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 ${cornerClass}`}
          />
          <div
            className={`absolute -right-1 -top-1 h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 ${cornerClass}`}
          />
          <div
            className={`absolute -left-1 -bottom-1 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 ${cornerClass}`}
          />
          <div
            className={`absolute -right-1 -bottom-1 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 ${cornerClass}`}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm md:left-1/2 md:right-auto md:bottom-5 md:w-fit md:-translate-x-1/2">
          Centralize o QR dentro da moldura para escanear.
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
        {!isScanning && (
          <Button
            onClick={startScanner}
            className="gap-2 bg-primary hover:bg-primary/90 text-foreground"
          >
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
      </div>
    </Card>
  );
}
