import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/constants/Tabs";
import { BannerCard } from "@/components/BannerCard";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { sponsorsAPI } from "@/api/sponsors";
import type { Sponsor, SponsorPackage } from "@/api/sponsors";
import { CrudTable } from "@/components/CrudTable";
import type { CrudField, CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";

const fields: CrudField[] = [
  { value: "cnpj", label: "CNPJ", type: "text" },
  { value: "name", label: "Nome", type: "text" },
  { value: "website", label: "Website", type: "text" },
  { value: "logo", label: "Logo", type: "text" },
  { value: "clicks", label: "Cliques", type: "number" },
];

function formatCNPJ(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function cleanCNPJ(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}



interface SponsorFormState {
  cnpj: string;
  name: string;
  website: string;
  logoMode: "url" | "file";
  logoUrl: string;
  logoFile: File | null;
}

function SponsorForm({
  value,
  onChange,
  disableCnpj,
}: {
  value: SponsorFormState;
  onChange: (v: SponsorFormState) => void;
  disableCnpj?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">CNPJ (14 dígitos)</Label>
        <Input
          value={formatCNPJ(value.cnpj)}
          disabled={disableCnpj}
          onChange={(e) => onChange({ ...value, cnpj: cleanCNPJ(e.target.value) })}
          placeholder="XX.XXX.XXX/XXXX-XX"
          maxLength={18}
          className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary disabled:opacity-60"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Nome</Label>
        <Input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Nome da empresa"
          className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Website</Label>
        <Input
          value={value.website}
          onChange={(e) => onChange({ ...value, website: e.target.value })}
          placeholder="https://empresa.com.br"
          className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-foreground text-sm">Logo</Label>
        <div className="flex gap-3 mb-2">
          {(["url", "file"] as const).map((mode) => (
            <label key={mode} className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
              <input
                type="radio"
                checked={value.logoMode === mode}
                onChange={() => onChange({ ...value, logoMode: mode, logoUrl: "", logoFile: null })}
                className="accent-primary"
              />
              {mode === "url" ? "URL externa" : "Upload de arquivo"}
            </label>
          ))}
        </div>

        {value.logoMode === "url" ? (
          <Input
            value={value.logoUrl}
            onChange={(e) => onChange({ ...value, logoUrl: e.target.value })}
            placeholder="https://cdn.empresa.com/logo.png"
            className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
          />
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="border border-muted/30 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              {value.logoFile ? value.logoFile.name : "Selecionar arquivo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                onChange({ ...value, logoFile: f });
              }}
            />
            {value.logoFile && (
              <span className="text-xs text-muted-foreground">{(value.logoFile.size / 1024).toFixed(0)} KB</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const emptyForm = (): SponsorFormState => ({
  cnpj: "",
  name: "",
  website: "",
  logoMode: "url",
  logoUrl: "",
  logoFile: null,
});

function buildFormData(form: SponsorFormState): FormData {
  const fd = new FormData();
  fd.append("cnpj", form.cnpj);
  fd.append("name", form.name);
  fd.append("website", form.website);
  if (form.logoMode === "file" && form.logoFile) {
    fd.append("logo", form.logoFile);
  } else {
    fd.append("logo_url", form.logoUrl);
  }
  return fd;
}

export default function SponsorsCRUD() {
  const canWrite = useHasPermission("Patrocinadores", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [data, setData] = useState<Sponsor[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de criar/editar
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Sponsor | null>(null);
  const [form, setForm] = useState<SponsorFormState>(emptyForm());

  // Painel de pacotes
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [packagesSponsor, setPackagesSponsor] = useState<Sponsor | null>(null);
  const [packages, setPackages] = useState<SponsorPackage[]>([]);
  const [pkgYear, setPkgYear] = useState(new Date().getFullYear());
  const [pkgName, setPkgName] = useState("");

  const fetchSponsors = useCallback(async (params?: CrudQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await sponsorsAPI.getAll(
        params?.page ?? 1,
        params?.pageSize ?? 10,
        params?.sortField ?? "name",
        params?.sortOrder ?? "asc",
        params?.filterField && params?.filterValue ? params.filterField : undefined,
        params?.filterValue || undefined,
      );
      setData(response.sponsors || []);
      setTotalRecords(response.filtered_records ?? response.total_records ?? 0);
    } catch {
      setError("Erro ao carregar patrocinadores");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    fetchSponsors(params);
  }, [fetchSponsors]);

  // Abre o dialog customizado de edição quando o pencil é clicado
  const handleEditClick = (_item: CrudItemType, itemKey: string) => {
    const sp = data.find((s) => s.cnpj === itemKey);
    if (!sp) return;
    setEditTarget(sp);
    setForm({
      cnpj: sp.cnpj,
      name: sp.name,
      website: sp.website,
      logoMode: "url",
      logoUrl: sp.logo,
      logoFile: null,
    });
    setEditOpen(true);
  };

  const handleDelete = async (itemKey: string) => {
    try {
      await sponsorsAPI.delete(itemKey);
      setData((prev) => prev.filter((s) => s.cnpj !== itemKey));
      setTotalRecords((prev) => prev - 1);
      showNotification("Patrocinador removido com sucesso", "success");
    } catch {
      showNotification("Erro ao remover patrocinador", "error");
    }
  };

  const handleCreate = async () => {
    if (form.cnpj.length !== 14) {
      showNotification("CNPJ deve ter 14 dígitos", "error");
      return;
    }
    try {
      const fd = buildFormData(form);
      const { sponsor: sp } = await sponsorsAPI.create(fd);
      setData((prev) => [...prev, sp]);
      setTotalRecords((prev) => prev + 1);
      setCreateOpen(false);
      setForm(emptyForm());
      showNotification("Patrocinador criado com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao criar patrocinador", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      const fd = buildFormData(form);
      const { sponsor: sp } = await sponsorsAPI.update(editTarget.cnpj, fd);
      setData((prev) => prev.map((s) => (s.cnpj === editTarget.cnpj ? sp : s)));
      setEditOpen(false);
      setEditTarget(null);
      showNotification("Patrocinador atualizado com sucesso", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao atualizar patrocinador", "error");
    }
  };

  const openPackages = async (sp: Sponsor) => {
    setPackagesSponsor(sp);
    try {
      const pkgs = await sponsorsAPI.getPackages(sp.cnpj);
      setPackages(pkgs);
    } catch {
      setPackages([]);
    }
    setPackagesOpen(true);
  };

  const handleAddPackage = async () => {
    if (!packagesSponsor || !pkgName.trim()) return;
    try {
      const { package: pkg } = await sponsorsAPI.addPackage(packagesSponsor.cnpj, pkgYear, pkgName.trim());
      setPackages((prev) => [...prev, pkg]);
      setPkgName("");
      showNotification("Pacote adicionado", "success");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Erro ao adicionar pacote", "error");
    }
  };

  const handleRemovePackage = async (pkg: SponsorPackage) => {
    if (!packagesSponsor) return;
    try {
      await sponsorsAPI.removePackage(packagesSponsor.cnpj, pkg.year, pkg.package);
      setPackages((prev) => prev.filter((p) => !(p.year === pkg.year && p.package === pkg.package)));
      showNotification("Pacote removido", "success");
    } catch {
      showNotification("Erro ao remover pacote", "error");
    }
  };

  // Adaptador: expõe os dados no shape que o CrudTable espera
  const tableData: CrudItemType[] = data.map((sp) => ({
    ...sp,
    cnpj: formatCNPJ(sp.cnpj),
    id: sp.cnpj,
  }));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <BannerCard
        icon={Tabs.find((t) => t.key === "sponsors")?.icon}
        iconClassName="text-violet-400"
        label="Patrocinadores"
        title="Gerenciamento de Patrocinadores"
        description="Cadastre, edite e remova patrocinadores. Gerencie pacotes por ano e acompanhe cliques."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
        )}
        {loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando patrocinadores...</p>
          </div>
        )}

        {/* Botão Novo fora do CrudTable para usar o formulário customizado */}
        {canWrite && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => { setForm(emptyForm()); setCreateOpen(true); }}
              className="bg-primary hover:bg-primary/90 text-foreground rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo patrocinador
            </Button>
          </div>
        )}

        <CrudTable
          data={tableData}
          fields={fields}
          onEdit={() => {}}
          onEditClick={handleEditClick}
          onDelete={handleDelete}
          getItemKey={(item) => (item as Sponsor & { id: string }).id}
          entityLabel="patrocinador"
          serverSide
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
          canWrite={canWrite}
          onAction={(item) => {
            const sp = data.find((s) => s.cnpj === (item as any).id);
            if (sp) openPackages(sp);
          }}
          actionIcon={<Package className="w-3.5 h-3.5" />}
          actionTitle="Gerenciar pacotes"
        />
      </div>

      {/* Modal Criar */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo patrocinador</DialogTitle>
          </DialogHeader>
          <SponsorForm value={form} onChange={setForm} />
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar patrocinador</DialogTitle>
          </DialogHeader>
          <SponsorForm value={form} onChange={setForm} disableCnpj />
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdate}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Pacotes */}
      <Dialog open={packagesOpen} onOpenChange={setPackagesOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Pacotes — {packagesSponsor?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {packages.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nenhum pacote cadastrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {packages.map((p) => (
                  <div key={`${p.year}-${p.package}`} className="flex items-center gap-1.5">
                    <Badge className="bg-amber-900/40 text-amber-300 border-amber-700/40 px-2 py-0.5 text-xs">
                      {p.year} · {p.package}
                    </Badge>
                    {canWrite && (
                      <button
                        onClick={() => handleRemovePackage(p)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remover pacote"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {canWrite && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm text-muted-foreground font-medium">Adicionar pacote</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pkgYear}
                    onChange={(e) => setPkgYear(Number(e.target.value))}
                    className="w-24 bg-muted/40 border-muted/30 text-foreground"
                    placeholder="Ano"
                    min={2000}
                    max={2100}
                  />
                  <Input
                    value={pkgName}
                    onChange={(e) => setPkgName(e.target.value)}
                    placeholder="Nome do pacote (ex: OURO)"
                    className="flex-1 bg-muted/40 border-muted/30 text-foreground"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddPackage(); }}
                  />
                  <Button
                    onClick={handleAddPackage}
                    disabled={!pkgName.trim()}
                    className="bg-primary hover:bg-primary/90 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPackagesOpen(false)} className="text-muted-foreground">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
