import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface BannerCardProps {
  icon?: ReactNode;
  iconClassName?: string;
  label: string;
  title: string;
  description: string;
  onBack?: () => void;
  backLabel?: string;
  cardClassName?: string;
  children?: ReactNode;
  labelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function BannerCard({
  icon,
  iconClassName = "w-4 h-4 text-secondary",
  label,
  title,
  description,
  onBack,
  backLabel = "Voltar",
  cardClassName = "border-border bg-card overflow-hidden relative",
  children,
  labelClassName = "text-xs uppercase tracking-[0.3em] text-secondary font-medium",
  titleClassName = "text-2xl md:text-3xl text-foreground font-semibold",
  descriptionClassName = "text-muted-foreground mt-1",
}: BannerCardProps) {
  return (
    <Card className={cardClassName + " overflow-hidden relative"}>
      {/* Gradientes decorativos */}
      <div className="pointer-events-none absolute top-0 left-0 w-200 h-40 bg-linear-to-br from-sky-400/30 via-violet-500/20 to-fuchsia-500/30 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none absolute -right-24 -top-16 w-120 h-60 rounded-full blur-3xl z-0 opacity-35 bg-[color-mix(in_srgb,#a21caf_60%,#0ea5e9_40%)]"/>
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-105 h-20 bg-linear-to-r from-fuchsia-500/20 via-blue-100-400/20 to-violet-500/20 rounded-full blur-2xl z-0" />
      {/* Conteúdo textual acima dos gradientes */}
      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            {icon && <span className={iconClassName + " drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"}>{icon}</span>}
            <p className={labelClassName + " ml-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"}>{label}</p>
          </div>
          <CardTitle className={titleClassName + " drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"}>{title}</CardTitle>
          <CardDescription className={descriptionClassName + " drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"}>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-destructive/20 gap-2 px-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            )}
            {children}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
