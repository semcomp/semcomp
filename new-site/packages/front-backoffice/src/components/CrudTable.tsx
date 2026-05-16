import type { CrudItemType } from "@/types/CrudItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronUp, ChevronsUpDown, ScanQrCode, Search, Plus, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";

export interface CrudField {
  value: string;
  label: string;
  type?: "text" | "select" | "date" | "number" | "multivalue";
  selectVariants?: Record<string, string>;
  multiValueOptions?: string[];
}

export interface CrudQueryParams {
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: "asc" | "desc";
  filterField: string;
  filterValue: string;
}

export interface CrudTableProps {
  data: CrudItemType[];
  fields: CrudField[];
  onEdit: (item: CrudItemType, itemKey: string) => void;
  onDelete: (id: string) => void;
  onCreate?: (item: CrudItemType) => void;
  onAction?: (item: CrudItemType, itemKey: string) => void;
  getItemKey?: (item: CrudItemType) => string;
  entityLabel?: string;
  defaultPageSize?: number;
  /** Ativa modo server-side: filtragem/sort/paginação são delegados ao pai */
  serverSide?: boolean;
  /** Total de registros no servidor (usado para calcular páginas no modo server-side) */
  totalRecords?: number;
  /** Callback chamado sempre que page, pageSize, sort ou filtro mudam (modo server-side) */
  onQueryChange?: (params: CrudQueryParams) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100, 200];

export function CrudTable({
  data,
  fields,
  onEdit,
  onDelete,
  onCreate,
  onAction,
  getItemKey,
  entityLabel = "item",
  defaultPageSize = 10,
  serverSide = false,
  totalRecords,
  onQueryChange,
}: CrudTableProps) {
  const [filter, setFilter] = useState("");
  const [filterField, setFilterField] = useState(fields[0]?.value ?? "name");
  const [sortField, setSortField] = useState(fields[0]?.value ?? "name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CrudItemType | null>(null);
  const [selectedItemKey, setSelectedItemKey] = useState("");

  type FormValue = string | string[];
  const [formData, setFormData] = useState<Record<string, FormValue>>({});

  // Helpers para multivalue
  const normalizeToStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((v) => String(v));
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  };

  const formatForCompare = (value: unknown): string => {
    if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
    return String(value ?? "");
  };

  const resolveItemKey = (item: CrudItemType): string => {
    if (getItemKey) return getItemKey(item);

    const id = (item as Record<string, unknown>)["id"];
    if (typeof id === "string" && id.trim()) return id;

    const fieldKey = fields
      .map((field) => formatForCompare((item as Record<string, unknown>)[field.value]).trim())
      .filter(Boolean)
      .join("|");

    return fieldKey || JSON.stringify(item);
  };

  // formata a hora vinda do GET do backend para deixar como valor no input
  const formatDateForInput = (val: unknown): string => {
    if (!val || typeof val !== "string") return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toISOString().slice(0, 16);
  };

  const toggleMultiValue = (fieldValue: string, option: string) => {
    setFormData((prev) => {
      const current = normalizeToStringArray(prev[fieldValue]);
      const exists = current.includes(option);
      const next = exists ? current.filter((v) => v !== option) : [...current, option];
      return { ...prev, [fieldValue]: next };
    });
  };


  // Notifica o pai quando qualquer parâmetro de query muda (modo server-side)
  useEffect(() => {
    if (!serverSide || !onQueryChange) return;
    onQueryChange({ page, pageSize, sortField, sortOrder, filterField, filterValue: filter });
  }, [page, pageSize, sortField, sortOrder, filterField, filter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(o => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleFilterFieldChange = (value: string) => {
    setFilterField(value);
    setFilter("");
    setPage(1);
  };

  // Modo local: filtra e ordena no cliente
  const filteredAll = useMemo(() => {
    if (serverSide) return data; // server já entregou os dados corretos
    let result = [...data];
    if (filter.trim()) {
      result = result.filter(item => {
        const val = formatForCompare((item as Record<string, unknown>)[filterField]).toLowerCase();
        return val.includes(filter.toLowerCase());
      });
    }
    result.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];

      const direction = sortOrder === "asc" ? 1 : -1;

      // tenta número
      if (typeof aVal === "number" && typeof bVal === "number") {
        const numA = Number(String(aVal).replace(/[^0-9.-]+/g, ""));
        const numB = Number(String(bVal).replace(/[^0-9.-]+/g, ""));
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return (numA - numB) * direction;
        }
      }

      // tenta data
      if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * direction;
      }

      // fallback string
      return formatForCompare(aVal).localeCompare(formatForCompare(bVal), "pt-BR", { numeric: true }) * direction;
    });
    return result;
  }, [data, filter, filterField, sortField, sortOrder, serverSide]);

  // No modo server-side o total vem do backend; no local é o array filtrado
  const effectiveTotal = serverSide ? (totalRecords ?? data.length) : filteredAll.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    if (serverSide) return data; // backend já paginiu
    const start = (safePage - 1) * pageSize;
    return filteredAll.slice(start, start + pageSize);
  }, [filteredAll, safePage, pageSize, serverSide, data]);

  const openEdit = (item: CrudItemType) => {
    setSelectedItem(item);
    setSelectedItemKey(resolveItemKey(item));
    const fd: Record<string, FormValue> = {};
    fields.forEach(f => {
      const raw = (item as Record<string, unknown>)[f.value];
      fd[f.value] = f.type === "multivalue" ? normalizeToStringArray(raw) : String(raw ?? "");
    });
    setFormData(fd);
    setEditOpen(true);
  };

  const openDelete = (item: CrudItemType) => {
    setSelectedItem(item);
    setSelectedItemKey(resolveItemKey(item));
    setDeleteOpen(true);
  };

  const openCreate = () => {
    const fd: Record<string, FormValue> = {};
    fields.forEach(f => { fd[f.value] = f.type === "multivalue" ? [] : ""; });
    setFormData(fd);
    setCreateOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="inline ml-1 w-3.5 h-3.5 opacity-30" />;
    return sortOrder === "asc"
      ? <ChevronUp className="inline ml-1 w-3.5 h-3.5 text-primary" />
      : <ChevronDown className="inline ml-1 w-3.5 h-3.5 text-primary" />;
  };

  const renderCell = (item: CrudItemType, field: CrudField) => {
    const raw = (item as Record<string, unknown>)[field.value];
    const val = String(raw ?? "—");

    if (field.type === "multivalue") {
      const values = normalizeToStringArray(raw);
      if (!values.length) return <span className="text-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1.5">
          {values.map((entry) => (
            <Badge key={`${field.value}-${entry}`} className="px-2 py-0.5 text-xs font-medium bg-muted/50 text-foreground">
              {entry}
            </Badge>
          ))}
        </div>
      );
    }

    // formata o valor de data passado ja como UTC vindo do back ou do input 
    // e oculta a timezone tambem deixando em estilo short
    if (field.type === "date") {
      return <span className="text-foreground">
        {isNaN(Date.parse(val)) ? val : new Date(val).toISOString().slice(0, 16).replace("T", " ")}
        </span>;
    }

    // For long text fields, ensure word-based wrapping in table cells
    if (field.type === "text" && val.length > 30) {
      return (
        <span className="wrap-break-word whitespace-normal block text-foreground">{val}</span>
      );
    }

    if (field.type === "select" && field.selectVariants) {
      const cls = field.selectVariants[val] ?? "bg-muted/50 text-foreground";
      return <Badge className={`text-xs font-medium px-2 py-0.5 ${cls}`}>{val}</Badge>;
    }

    // Se o texto for muito longo, quebra em múltiplas linhas e limita largura
    if (typeof val === "string" && val.length > 40) {
      return (
        <span className="text-foreground whitespace-pre-line wrap-break-word max-w-xs block">
          {val}
        </span>
      );
    }
    return <span className="text-foreground">{val}</span>;
  };

  const startItem = effectiveTotal === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = serverSide ? Math.min(safePage * pageSize, effectiveTotal) : Math.min(safePage * pageSize, filteredAll.length);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-1 w-full">
          <Select value={filterField} onValueChange={handleFilterFieldChange}>
            <SelectTrigger className="w-36 bg-muted/40 border-muted/30 text-foreground text-sm">
              <SelectValue />
            </SelectTrigger>
            
            <SelectContent 
              position="popper" 
              sideOffset={4} 
              className="w-36 bg-white border-muted/30 shadow-md"
            >
              {fields.map(f => (
                <SelectItem 
                  key={f.value} 
                  value={f.value} 
                  className="text-primary focus:bg-muted/50 cursor-pointer"
                >
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={`Filtrar por ${fields.find(f => f.value === filterField)?.label ?? "campo"}…`}
              value={filter}
              onChange={e => {handleFilterChange(e.target.value); if (serverSide && onQueryChange) onQueryChange({ page , pageSize, sortField, sortOrder, filterField, filterValue: e.target.value });}}
              className="pl-9 bg-muted/40 border-muted/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
            {filter && (
              <button
                onClick={() => {handleFilterChange(""); if (serverSide && onQueryChange) onQueryChange({ page , pageSize, sortField, sortOrder, filterField, filterValue: "" });}}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {onCreate && (
          <Button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-foreground rounded-xl gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo {entityLabel}
          </Button>
        )}
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Info + Quantidade por página */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {effectiveTotal === 0
              ? "Nenhum registro"
              : `${startItem}–${endItem} de ${effectiveTotal} registro${effectiveTotal !== 1 ? "s" : ""}`}
            {!serverSide && filter && filteredAll.length !== data.length && (
              <span className="ml-1 text-slate-600">(filtrado de {data.length})</span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={v => { setPageSize(Number(v)); setPage(1); if (serverSide && onQueryChange) onQueryChange({ page , pageSize: Number(v), sortField, sortOrder, filterField, filterValue: filter }); }}
            >
              <SelectTrigger className="h-7 w-14 bg-muted/40 border-muted/30 text-foreground text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              
              <SelectContent
                position="popper" 
                sideOffset={4}
                className="min-w-14 bg-foreground border border-muted/30 shadow-md z-50"
              >
                {PAGE_SIZE_OPTIONS.map(n => (
                  <SelectItem 
                    key={n} 
                    value={String(n)} 
                    className="text-primary text-xs focus:bg-muted/50 cursor-pointer"
                  >
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Números Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30"
              title="Primeira página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-muted-foreground/60 text-sm select-none">
                  ···
                </span>
              ) : (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p as number)}
                  className={`h-8 w-8 p-0 rounded-lg text-sm transition-all ${
                    safePage === p
                      ? "bg-primary text-foreground hover:bg-primary/90 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
              {fields.map(f => (
                <TableHead
                  key={f.value}
                  className="cursor-pointer select-none text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                  onClick={() => {handleSort(f.value); if (serverSide && onQueryChange) onQueryChange({ page, pageSize, sortField, sortOrder, filterField, filterValue: filter });} }
                >
                  {f.label}
                  <SortIcon field={f.value} />
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-30" />
                    <p>Nenhum resultado encontrado</p>
                    {filter && (
                      <button onClick={() => handleFilterChange("")} className="text-primary hover:text-primary/80 text-sm">
                        Limpar filtro
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, i) => (
                <TableRow
                  key={resolveItemKey(item) || `row-${i}`}
                  className={`border-border transition-colors hover:bg-muted/20 ${
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                  }`}
                >
                  {fields.map(f => (
                    <TableCell key={f.value} className="py-3">
                      {renderCell(item, f)}
                    </TableCell>
                  ))}
                  <TableCell className="py-3">
                    <div className="flex gap-1.5">
                      {onAction && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAction(item, resolveItemKey(item))}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg"
                          title="Coletar presença"
                        >
                          <ScanQrCode className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDelete(item)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>



      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo {entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <Label htmlFor={`create-${f.value}`} className="text-foreground text-sm">{f.label}</Label>
                {f.type === "select" && f.selectVariants ? (
                  <Select value={formData[f.value] as string} onValueChange={v => setFormData(d => ({ ...d, [f.value]: v }))}>
                    <SelectTrigger className="bg-muted/40 border-muted/30 text-foreground">
                      <SelectValue placeholder={`Selecionar ${f.label}`} />
                    </SelectTrigger>
                    <SelectContent 
                      position="popper" 
                      sideOffset={4} 
                      className="w-36 bg-white border-muted/30 shadow-md"
                    >
                    {Object.keys(f.selectVariants).map(v => (
                      <SelectItem 
                        key={v} 
                        value={v} 
                        className="text-primary focus:bg-accent focus:text-accent-foreground cursor-pointer"
                      >
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                ) : f.type === "multivalue" ? (
                  <div className="rounded-xl p-2.5">
                    {f.multiValueOptions && f.multiValueOptions.length > 0 ? (
                      <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                        {f.multiValueOptions.map((option) => {
                          const selected = normalizeToStringArray(formData[f.value]).includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMultiValue(f.value, option)}
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-card transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <svg className="h-3.5 w-3.5 text-foreground opacity-0 transition-opacity duration-150 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        id={`create-${f.value}`}
                        value={normalizeToStringArray(formData[f.value]).join(", ")}
                        onChange={(e) =>
                          setFormData((d) => ({
                            ...d,
                            [f.value]: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="Separe por vírgula"
                      />
                    )}
                  </div>
                ) : f.type === "date" ? (
                  // input de datahora inicio
                  <Input 
                    type="datetime-local"
                    lang="pt-BR"
                    id={`create-${f.value}`}
                    value={formatDateForInput(formData[f.value])} // formatação do value vindo do state já salvo
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((d) => ({
                        ...d,
                        [f.value]: val ? new Date(val + "Z").toISOString() : "", // alteração gera salvamento no state
                      }));
                    }}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                ) : (
                  f.value.toLowerCase().includes("desc") || f.value.toLowerCase().includes("obs") || f.value.toLowerCase().includes("coment") ? (
                    <textarea
                      id={`create-${f.value}`}
                      value={formData[f.value] as string ?? ""}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      rows={4}
                      className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary rounded-lg w-full min-h-24 max-h-48 resize-y px-3 py-2 text-sm"
                      style={{ minWidth: '180px'}}
                    />
                  ) : (
                    <Input
                      id={`create-${f.value}`}
                      value={formData[f.value] as string ?? ""}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                    />
                  )
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (onCreate) onCreate({ id: "", name: formData["name"] ?? "", ...formData } as CrudItemType);
                setCreateOpen(false);
              }}
            >
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar {entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <Label className="text-foreground text-sm">{f.label}</Label>
                {f.type === "select" && f.selectVariants ? (
                  <Select value={formData[f.value] as string} onValueChange={v => setFormData(d => ({ ...d, [f.value]: v }))}>
                    <SelectTrigger className="bg-muted/40 border-muted/30 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="popper" 
                      sideOffset={4} 
                      className="w-36 bg-white border-muted/30 shadow-md"
                    >
                      {Object.keys(f.selectVariants).map(v => (
                        <SelectItem key={v} value={v} className="text-primary focus:bg-muted/50">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "multivalue" ? (
                  <div className="rounded-xl p-2.5">
                    {f.multiValueOptions && f.multiValueOptions.length > 0 ? (
                      <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                        {f.multiValueOptions.map((option) => {
                          const selected = normalizeToStringArray(formData[f.value]).includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMultiValue(f.value, option)}
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-card transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <svg className="h-3.5 w-3.5 text-foreground opacity-0 transition-opacity duration-150 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        value={normalizeToStringArray(formData[f.value]).join(", ")}
                        onChange={(e) =>
                          setFormData((d) => ({
                            ...d,
                            [f.value]: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="Separe por vírgula"
                      />
                    )}
                  </div>
                ) : f.type === "date" ? (
                  // input de datahora fim
                  <Input
                    type="datetime-local"
                    lang="pt-BR"
                    value={formatDateForInput(formData[f.value])} //formatação do value do input vindo do state
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((d) => ({
                        ...d,
                        [f.value]: val ? new Date(val + "Z").toISOString() : "", // alteração gera salvamento no state
                      }));
                    }}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                ) : (
                  f.value.toLowerCase().includes("desc") || f.value.toLowerCase().includes("obs") || f.value.toLowerCase().includes("coment") ? (
                    <textarea
                      value={formData[f.value] as string ?? ""}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      rows={4}
                      className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary rounded-lg w-full min-h-24 max-h-48 resize-y px-3 py-2 text-sm"
                      style={{ minWidth: '180px' }}
                    />
                  ) : (
                    <Input
                      value={formData[f.value] as string ?? ""}
                      onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                      className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                    />
                  )
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="text-muted-foreground">Cancelar</Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (selectedItem) onEdit({ ...selectedItem, ...formData } as CrudItemType, selectedItemKey);
                setEditOpen(false);
              }}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">
            Confirmar exclusão
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 text-center">
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja excluir? Esta ação não pode ser desfeita.
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => setDeleteOpen(false)} 
            className="text-muted-foreground hover:bg-muted/20"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (selectedItem) {
                const itemId = selectedItemKey || resolveItemKey(selectedItem);
                if (itemId) onDelete(itemId);
              }
              setDeleteOpen(false);
            }}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}