import { CrudTable } from "@/components/CrudTable";
import type { CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { signinEventsAPI } from "@/api/signinEvent.ts";
import type { SigninEventType } from "@/types/SigninEventType";
import { API_FIELD_MAP, fields } from "@/data/eventRegistrationCrudField";
import { Tabs } from "@/constants/Tabs";
import { useHasPermission } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";

export default function EventRegistration() {
    const canWrite = useHasPermission("Inscrições", "RW");

    const navigate = useNavigate();

    const [data, setData] = useState<SigninEventType[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { showNotification } = useNotification();

    const resolveSigninKey = useCallback((item: CrudItemType) => {
        const signin = item as SigninEventType;

        return `${signin.userNumber}__${signin.eventName}__${signin.eventInitDate}`;
    }, []);

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
        } catch (err: any) {
            console.error("Erro ao buscar inscrições:", err);
            const msg =
                err.response?.data?.message ||
                "Erro ao carregar inscrições";
            setError(msg);
            setData([]);
            showNotification(msg, "error");
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const handleQueryChange = useCallback(
        (params: CrudQueryParams) => {
            fetchSignins(params);
        },
        [fetchSignins]
    );

    const handleDelete = async (itemKey: string) => {
        try {
            const signin = data.find(
                (item) => resolveSigninKey(item) === itemKey
            );

            if (!signin) return;

            await signinEventsAPI.delete(
                signin.userNumber,
                signin.eventName,
                signin.eventInitDate
            );

            setData((prev) =>
                prev.filter(
                (item) => resolveSigninKey(item) !== itemKey
                )
            );

            setTotalRecords((prev) => prev - 1);

            showNotification(
                "Inscrição deletada com sucesso",
                "success"
            );
            } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Erro ao deletar inscrição";

            showNotification(msg, "error");
        }
    };

    const handleCreate = async (item: CrudItemType) => {
        try {
            const typedItem = item as SigninEventType;

            const createdSignin = await signinEventsAPI.create(typedItem);

            setData((prev) => [...prev, createdSignin]);
            setTotalRecords((prev) => prev + 1);

            showNotification(
                "Inscrição criada com sucesso",
                "success"
            );

        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Erro ao criar inscrição";

            showNotification(msg, "error");
        }
    };

    const handleEdit = async (
        item: CrudItemType,
        itemKey: string
    ) => {
        try {
            const typedItem = item as SigninEventType;

            const originalSignin = data.find(
                (signin) => resolveSigninKey(signin) === itemKey
            );

            if (!originalSignin) return;

            const updatedSignin = await signinEventsAPI.update(
                originalSignin.userNumber,
                originalSignin.eventName,
                originalSignin.eventInitDate,
                typedItem
            );

            setData((prev) =>
                prev.map((signin) =>
                    resolveSigninKey(signin) === itemKey
                        ? updatedSignin
                        : signin
                )
            );

            showNotification(
                "Inscrição editada com sucesso",
                "success"
            );

        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                "Erro ao editar inscrição";

            showNotification(msg, "error");
        }
    };

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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    getItemKey={resolveSigninKey}
                    entityLabel="inscrição"
                    serverSide
                    totalRecords={totalRecords}
                    onQueryChange={handleQueryChange}
                    canWrite={canWrite}
                />
            </div>
        </section>
    );
}