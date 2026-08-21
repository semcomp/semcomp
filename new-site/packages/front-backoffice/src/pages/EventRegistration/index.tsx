import { CrudTable } from "@/components/CrudTable";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import type { CrudQueryParams } from "@/components/CrudTable";
import { Tabs } from "@/constants/Tabs";
import { signinEventsAPI } from "@/api/signinEvent.ts";
import type { SigninEventType } from "@/types/SigninEventType";
import { API_FIELD_MAP, fields } from "@/data/eventRegistrationCrudField";

export default function EventRegistration() {
    const navigate = useNavigate();
    const [data, setData] = useState<SigninEventType[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSignins = useCallback(async (params?: CrudQueryParams) => {
        try {
            setLoading(true);
            setError(null);

            const sortFieldApi =
            API_FIELD_MAP[params?.sortField ?? ""] ||
            params?.sortField ||
            "event_init_date";

            const filterFieldApi = params?.filterField
            ? API_FIELD_MAP[params.filterField] || params.filterField
            : "user_number";

            const response = await signinEventsAPI.getAll(
            params?.page ?? 1,
            params?.pageSize ?? 10,
            sortFieldApi,
            params?.sortOrder ?? "asc",
            filterFieldApi,
            params?.filterValue || undefined
            );

            setData(response.signins || []);
            setTotalRecords(
            response.filtered_records ??
            response.total_records ??
            0
            );
        } catch (err) {
            console.error("Erro ao buscar inscrições:", err);
            setError("Erro ao carregar inscrições");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleQueryChange = useCallback(
        (params: CrudQueryParams) => {
            fetchSignins(params);
        },
        [fetchSignins]
    );

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
                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
                    {error}
                    </div>
                )}

                {loading && data.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                    <p className="text-slate-400">Carregando inscrições...</p>
                    </div>
                )}

                <CrudTable
                    data={data}
                    fields={fields}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    serverSide
                    totalRecords={totalRecords}
                    onQueryChange={handleQueryChange}
                    canWrite={false}
                    entityLabel="inscrição"
                />
            </div>
        </section>
    );
}