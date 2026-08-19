import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { Tabs } from "@/constants/Tabs";
import { fields } from "@/data/eventRegistrationCrudField";

export default function EventRegistration() {
    const navigate = useNavigate();

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
            <BannerCard
                icon={Tabs.find((tab) => tab.key === "event-registration")?.icon}
                iconClassName="text-violet-400"
                label="Inscrições"
                title="Inscrições em Eventos"
                description="Acompanhe os participantes inscritos em cada evento e gerencie suas inscrições."
                onBack={() => navigate("/home")}
                cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
                labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
                titleClassName="text-2xl md:text-3xl text-white font-semibold"
                descriptionClassName="text-slate-400 mt-1"
            />

            <div className="rounded-xl border border-border bg-card/80 p-5">
                Conteúdo*
            </div>
        </section>
    );
}