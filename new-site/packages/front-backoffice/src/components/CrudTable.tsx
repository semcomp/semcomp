import type { CrudItemType } from "@/types/CrudItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ScanQrCode,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
} from "lucide-react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CrudField {
  value: string;
  /** Coluna real usada para ordenação quando `value` é um campo de exibição
   *  (ex.: "total_amount_formatted" ordena por "total_amount"). */
  sortValue?: string;
  label: string;
  type?:
    | "text"
    | "url"
    | "textarea"
    | "select"
    | "date"
    | "number"
    | "multivalue"
    | "boolean"
    | "file";
  selectVariants?: Record<string, string>;
  multiValueOptions?: string[];
  readOnly?: boolean;
  accept?: string;
  /** Hides the field in the form unless formData[field] === value */
  showWhen?: { field: string; value: unknown };
  /** Quando true, o campo é exibido no dialog mas não pode ser editado */
  readonly?: boolean;
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
  /** When false, hides create/edit/delete buttons */
  canWrite?: boolean;
  onAction?: (item: CrudItemType, itemKey: string) => void;
  getItemKey?: (item: CrudItemType) => string;
  entityLabel?: string;
  defaultPageSize?: number;
  /** Total records on the server (used to calculate page count) */
  totalRecords?: number;
  /** Called whenever page, pageSize, sort or filter changes */
  onQueryChange?: (params: CrudQueryParams) => void;
  /** Overrides the default edit button behavior (skips the internal dialog) */
  onEditClick?: (item: CrudItemType, itemKey: string) => void;
  /** Custom icon for the action button (default: ScanQrCode) */
  actionIcon?: React.ReactNode;
  /** Tooltip for the action button */
  actionTitle?: string;
}

type FormValue = string | string[] | boolean | File | null;

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100, 200];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string")
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  return [];
}

function formatForCompare(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  return String(value ?? "");
}

function formatDateForInput(val: unknown): string {
  if (!val || typeof val !== "string") return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── FilterControl ─────────────────────────────────────────────────────────────

// Type-aware filter: boolean → Sim/Não select, select+variants → variant select, others → text input.
function FilterControl({
  activeField,
  filter,
  onChange,
}: {
  activeField: CrudField | undefined;
  filter: string;
  onChange: (v: string) => void;
}) {
  const triggerCls = "flex-1 bg-muted/40 border-muted/30 text-foreground text-sm";
  const itemCls = "text-primary focus:bg-muted/50 cursor-pointer";

  if (activeField?.type === "boolean") {
    return (
      <Select
        value={filter || "__all__"}
        onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className={triggerCls}>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="bg-white border-muted/30 shadow-md"
        >
          <SelectItem value="__all__" className={itemCls}>Todos</SelectItem>
          <SelectItem value="true" className={itemCls}>Sim</SelectItem>
          <SelectItem value="false" className={itemCls}>Não</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (activeField?.type === "select" && activeField.selectVariants) {
    return (
      <Select
        value={filter || "__all__"}
        onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className={triggerCls}>
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="bg-white border-muted/30 shadow-md"
        >
          <SelectItem value="__all__" className={itemCls}>Todos</SelectItem>
          {Object.keys(activeField.selectVariants).map((v) => (
            <SelectItem key={v} value={v} className={itemCls}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={`Filtrar por ${activeField?.label ?? "campo"}…`}
        value={filter}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 bg-muted/40 border-muted/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
      />
      {filter && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── CrudTable ────────────────────────────────────────────────────────────────

export function CrudTable({
  data,
  fields,
  onEdit,
  onDelete,
  onCreate,
  onAction,
  onEditClick,
  actionIcon,
  actionTitle,
  getItemKey,
  entityLabel = "item",
  defaultPageSize = 10,
  totalRecords,
  onQueryChange,
  canWrite = true,
}: CrudTableProps) {
  // Fields that make sense as filter targets (files cannot be text-searched)
  const filterableFields = fields.filter((f) => f.type !== "file");

  const [filter, setFilter] = useState("");
  const [filterField, setFilterField] = useState(
    filterableFields[0]?.value ?? "name"
  );
  const [sortField, setSortField] = useState(
    fields[0]?.sortValue ?? fields[0]?.value ?? "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CrudItemType | null>(null);
  const [selectedItemKey, setSelectedItemKey] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Record<string, FormValue>>({});

  // Linhas com texto longo expandidas por clique (chave: resolveItemKey(item)).
  // Ao contrário da versão anterior (expandedCells), o toggle é por linha inteira.
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const resolveItemKey = (item: CrudItemType): string => {
    if (getItemKey) return getItemKey(item);
    const id = (item as Record<string, unknown>)["id"];
    if (typeof id === "string" && id.trim()) return id;
    const fieldKey = fields
      .map((field) =>
        formatForCompare(
          (item as Record<string, unknown>)[field.value]
        ).trim()
      )
      .filter(Boolean)
      .join("|");
    return fieldKey || JSON.stringify(item);
  };

  // Indica se a linha tem célula de texto longo (textarea >120 ou string >40),
  // o que habilita o toggle de expandir/recolher ao clicar na linha.
  const rowHasExpandableContent = (item: CrudItemType): boolean => {
    return fields.some((field) => {
      if (field.type === "url") return false; // URL tem truncate próprio
      const raw = (item as Record<string, unknown>)[field.value];
      const val = String(raw ?? "");
      if (field.type === "textarea") return val.length > 120;
      return val.length > 40;
    });
  };

  const toggleRowExpanded = (rowKey: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  const toggleMultiValue = (fieldValue: string, option: string) => {
    setFormData((prev) => {
      const current = normalizeToStringArray(prev[fieldValue]);
      const exists = current.includes(option);
      const next = exists
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [fieldValue]: next };
    });
  };

  useEffect(() => {
    if (!onQueryChange) return;
    onQueryChange({
      page,
      pageSize,
      sortField,
      sortOrder,
      filterField,
      filterValue: filter,
    });
  }, [page, pageSize, sortField, sortOrder, filterField, filter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
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

  const activeFilterField = filterableFields.find(
    (f) => f.value === filterField
  );

  const effectiveTotal = totalRecords ?? data.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const safePage = Math.min(page, totalPages);

  const openEdit = (item: CrudItemType) => {
    setSelectedItem(item);
    setSelectedItemKey(resolveItemKey(item));
    const fd: Record<string, FormValue> = {};
    fields.forEach((f) => {
      if (f.readonly) return;
      const raw = (item as Record<string, unknown>)[f.value];
      if (f.type === "multivalue") fd[f.value] = normalizeToStringArray(raw);
      else if (f.type === "boolean") fd[f.value] = raw === true || raw === "true";
      else if (f.type === "date") fd[f.value] = formatDateForInput(raw);
      else fd[f.value] = String(raw ?? "");
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
    fields.forEach((f) => {
      if (f.type === "multivalue") fd[f.value] = [];
      else if (f.type === "boolean") fd[f.value] = false;
      else if (f.type === "file") fd[f.value] = null;
      else if (f.type === "date") {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        fd[f.value] = local + ":00";
      } else fd[f.value] = "";
    });
    setFormData(fd);
    setCreateOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field)
      return (
        <ChevronsUpDown className="inline ml-1 w-3.5 h-3.5 opacity-30" />
      );
    return sortOrder === "asc" ? (
      <ChevronUp className="inline ml-1 w-3.5 h-3.5 text-primary" />
    ) : (
      <ChevronDown className="inline ml-1 w-3.5 h-3.5 text-primary" />
    );
  };

  const renderCell = (item: CrudItemType, field: CrudField) => {
    const raw = (item as Record<string, unknown>)[field.value];
    const val = String(raw ?? "—");

    if (field.type === "boolean") {
      const bool = Boolean(raw);
      return (
        <Badge
          className={`text-xs font-medium px-2 py-0.5 ${
            bool
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-slate-600/40 text-slate-400 border border-slate-600/30"
          }`}
        >
          {bool ? "Sim" : "Não"}
        </Badge>
      );
    }

    if (field.type === "multivalue") {
      const values = normalizeToStringArray(raw);
      if (!values.length) return <span className="text-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1.5">
          {values.map((entry) => (
            <Badge
              key={`${field.value}-${entry}`}
              className="px-2 py-0.5 text-xs font-medium bg-muted/50 text-foreground"
            >
              {entry}
            </Badge>
          ))}
        </div>
      );
    }

    if (field.type === "date") {
      const parsedDate = new Date(val);
      return (
        <span className="text-foreground">
          {isNaN(parsedDate.getTime())
            ? val
<<<<<<< HEAD
            : new Date(val).toISOString().slice(0, 16).replace("T", " ")}
        </span>
      );
    }

    // Para campos de texto longos, trunca com reticências em vez de quebrar
    // linha — quebrar em uma tabela com layout automático faz a coluna
    // colapsar e as letras empilharem verticalmente. Texto completo fica
    // disponível ao abrir a ação de visualizar/editar da linha.
    if (field.type === "text" && val.length > 30) {
      return (
        <span
          className="block max-w-xs min-w-40 truncate text-foreground"
          title={val}
        >
          {val}
=======
            : parsedDate.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
>>>>>>> dev
        </span>
      );
    }

    if (field.type === "select" && field.selectVariants) {
      const cls =
        field.selectVariants[val] ?? "bg-muted/50 text-foreground";
      return (
        <Badge className={`text-xs font-medium px-2 py-0.5 ${cls}`}>
          {val}
        </Badge>
      );
    }

<<<<<<< HEAD
    // Se o texto for muito longo, trunca com reticências em vez de quebrar
    // linha — quebrar em uma tabela com layout automático faz a coluna
    // colapsar e as letras empilharem verticalmente. Texto completo fica
    // disponível ao abrir a ação de visualizar/editar da linha.
    if (typeof val === "string" && val.length > 40) {
      return (
        <span className="block max-w-xs min-w-40 truncate text-foreground" title={val}>
=======
    if (field.type === "textarea") {
      if (!val || val === "—") return <span className="text-muted-foreground">—</span>;
      // O expandir/recolher é controlado pela linha (TableRow onClick).
      const expanded = expandedRows.has(resolveItemKey(item));
      return (
        <div className="max-w-2xs" title={val}>
          {/* whitespace-normal sobrescreve o whitespace-nowrap do TableCell do
              shadcn (que impediria a quebra de linha ao expandir).
              max-w-2xs fixa o teto da coluna — max-w-xs NÃO usar: neste projeto
              resolve pra 6px (--spacing-xs) e empilha os caracteres.
              `block` e line-clamp-2 são mutuamente exclusivos: o `block`
              sobrescreve o display:-webkit-box que o clamp exige. */}
          <span
            className={`text-foreground whitespace-normal break-words max-w-2xs ${expanded ? "block" : "line-clamp-2"}`}
          >
            {val}
          </span>
        </div>
      );
    }

    if (field.type === "url") {
      if (!val || val === "—") return <span className="text-muted-foreground">—</span>;
      return (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline max-w-40 truncate"
          title={val}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{val.replace(/^https?:\/\//, "")}</span>
        </a>
      );
    }

    if (val.length > 40) {
      // Texto longo: recua para 2 linhas por padrão; expande quando a linha é
      // clicada (toggle por linha, igual ao textarea).
      const expanded = expandedRows.has(resolveItemKey(item));
      return (
        <span
          className={`text-foreground whitespace-normal break-words max-w-2xs ${expanded ? "block" : "line-clamp-2"}`}
          title={val}
        >
>>>>>>> dev
          {val}
        </span>
      );
    }

    return <span className="text-foreground">{val}</span>;
  };

  const startItem = effectiveTotal === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, effectiveTotal);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    ) {
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
              {filterableFields.map((f) => (
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

          <FilterControl
            activeField={activeFilterField}
            filter={filter}
            onChange={handleFilterChange}
          />
        </div>

        {canWrite && onCreate && (
          <Button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-foreground rounded-xl gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo {entityLabel}
          </Button>
        )}
      </div>

      {/* Pagination info + page size */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {effectiveTotal === 0
              ? "Nenhum registro"
              : `${startItem}–${endItem} de ${effectiveTotal} registro${
                  effectiveTotal !== 1 ? "s" : ""
                }`}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-14 bg-muted/40 border-muted/30 text-foreground text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                className="min-w-14 bg-foreground border border-muted/30 shadow-md z-50"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
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

        {/* Page numbers */}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 text-center text-muted-foreground/60 text-sm select-none"
                >
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
              {fields.map((f) => (
                <TableHead
                  key={f.value}
                  className="cursor-pointer select-none text-muted-foreground text-xs font-semibold uppercase tracking-wider hover:text-primary transition-colors"
                  onClick={() => handleSort(f.sortValue ?? f.value)}
                >
                  {f.label}
                  <SortIcon field={f.value} />
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-24">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={fields.length + 1}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-30" />
                    <p>Nenhum resultado encontrado</p>
                    {filter && (
                      <button
                        onClick={() => handleFilterChange("")}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        Limpar filtro
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => {
                const rowKey = resolveItemKey(item) || `row-${i}`;
                const expandable = rowHasExpandableContent(item);
                const expanded = expandable && expandedRows.has(rowKey);
                return (
                  <TableRow
                    key={rowKey}
                    onClick={expandable ? () => toggleRowExpanded(rowKey) : undefined}
                    className={`border-border transition-colors ${
                      expandable ? "cursor-pointer select-none" : ""
                    } ${
                      i % 2 === 0
                        ? expanded
                          ? "bg-muted/20"
                          : "bg-transparent hover:bg-muted/20"
                        : expanded
                          ? "bg-muted/20"
                          : "bg-muted/10 hover:bg-muted/20"
                    }`}
                  >
                    {fields.map((f) => (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(item, resolveItemKey(item));
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg"
                            title={actionTitle}
                          >
                            {actionIcon ?? (
                              <ScanQrCode className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        {canWrite && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick
                                  ? onEditClick(item, resolveItemKey(item))
                                  : openEdit(item);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                              title="Editar"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDelete(item);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Novo {entityLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.filter((f) => !f.readonly).map((f) => (
              <div key={f.value} className="space-y-1.5">
                <Label
                  htmlFor={`create-${f.value}`}
                  className="text-foreground text-sm"
                >
                  {f.label}
                </Label>
                {f.type === "select" && f.selectVariants ? (
                  <Select
                    value={formData[f.value] as string}
                    onValueChange={(v) =>
                      setFormData((d) => ({ ...d, [f.value]: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted/40 border-muted/30 text-foreground">
                      <SelectValue placeholder={`Selecionar ${f.label}`} />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      className="w-36 bg-white border-muted/30 shadow-md"
                    >
                      {Object.keys(f.selectVariants).map((v) => (
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
                          const selected = normalizeToStringArray(
                            formData[f.value]
                          ).includes(option);
                          return (
                            <label
                              key={option}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleMultiValue(f.value, option)
                                }
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-card transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <svg
                                  className="h-3.5 w-3.5 text-foreground opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        id={`create-${f.value}`}
                        value={normalizeToStringArray(formData[f.value]).join(
                          ", "
                        )}
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
                    value={(formData[f.value] as string)?.slice(0, 16) ?? ""} // formatação do value vindo do state já salvo
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((d) => ({
                        ...d,
                        [f.value]: val ? val + ":00" : "",
                      }));
                    }}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                ) : f.value.toLowerCase().includes("desc") ||
                  f.value.toLowerCase().includes("obs") ||
                  f.value.toLowerCase().includes("coment") ? (
                  <textarea
                    id={`create-${f.value}`}
                    value={(formData[f.value] as string) ?? ""}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, [f.value]: e.target.value }))
                    }
                    rows={4}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary rounded-lg w-full min-h-24 max-h-48 resize-y px-3 py-2 text-sm"
                    style={{ minWidth: "180px" }}
                  />
                ) : f.type === "boolean" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      id={`field-${f.value}`}
                      checked={Boolean(formData[f.value])}
                      onCheckedChange={(checked) =>
                        setFormData((d) => ({ ...d, [f.value]: checked }))
                      }
                    />
                    <Label
                      htmlFor={`field-${f.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {f.label}
                    </Label>
                  </div>
                ) : f.type === "file" ? (
                  (!f.showWhen || formData[f.showWhen.field] === f.showWhen.value) ? (
                    <div className="space-y-1">
                      <Input
                        type="file"
                        accept={f.accept || ".pdf,.jpg,.jpeg,.png,.webp"}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData((prev) => ({
                            ...prev,
                            [f.value]: file,
                          }));
                        }}
                        className="bg-muted/40 border-muted/30 text-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {formData[f.value] instanceof File
                          ? `✅ Arquivo selecionado: ${
                              (formData[f.value] as File).name
                            }`
                          : "Anexe o comprovante (PDF, JPG ou PNG)."}
                      </p>
                    </div>
                  ) : null
                ) : (
                  <Input
                    id={`create-${f.value}`}
                    value={(formData[f.value] as string) ?? ""}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, [f.value]: e.target.value }))
                    }
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={saving}
              onClick={async () => {
                if (!onCreate) return;
                setSaving(true);
                try {
                  await onCreate({
                    id: "",
                    name: formData["name"] ?? "",
                    ...formData,
                  } as CrudItemType);
                  setCreateOpen(false);
                } catch {
                  // Mantém o dialog aberto; o handler já notifica o erro.
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Editar {entityLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map((f) => (
              <div key={f.value} className="space-y-1.5">
                <Label className="text-foreground text-sm">{f.label}</Label>
                {f.readonly ? (
                  f.type === "boolean" ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean((selectedItem as Record<string, unknown>)?.[f.value])}
                        disabled
                        className="h-4 w-4 rounded border-muted-foreground/30 opacity-60 cursor-not-allowed"
                      />
                      <span className="text-sm text-muted-foreground italic">somente leitura</span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-md bg-muted/20 border border-muted/20 text-sm text-muted-foreground italic">
                      {String((selectedItem as Record<string, unknown>)?.[f.value] ?? "—")}
                    </div>
                  )
                ) : f.type === "select" && f.selectVariants ? (
                  <Select
                    value={formData[f.value] as string}
                    onValueChange={(v) =>
                      setFormData((d) => ({ ...d, [f.value]: v }))
                    }
                  >
                    <SelectTrigger className="bg-muted/40 border-muted/30 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      className="w-36 bg-white border-muted/30 shadow-md"
                    >
                      {Object.keys(f.selectVariants).map((v) => (
                        <SelectItem
                          key={v}
                          value={v}
                          className="text-primary focus:bg-muted/50"
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
                          const selected = normalizeToStringArray(
                            formData[f.value]
                          ).includes(option);
                          return (
                            <label
                              key={option}
                              className="flex items-center gap-2 text-sm text-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleMultiValue(f.value, option)
                                }
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary bg-card transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                                <svg
                                  className="h-3.5 w-3.5 text-foreground opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </span>
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        value={normalizeToStringArray(formData[f.value]).join(
                          ", "
                        )}
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
                    value={(formData[f.value] as string)?.slice(0, 16) ?? ""} //formatação do value do input vindo do state
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((d) => ({
                        ...d,
                        [f.value]: val ? val + ":00" : "",
                      }));
                    }}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                ) : f.value.toLowerCase().includes("desc") ||
                  f.value.toLowerCase().includes("obs") ||
                  f.value.toLowerCase().includes("coment") ? (
                  <textarea
                    value={(formData[f.value] as string) ?? ""}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, [f.value]: e.target.value }))
                    }
                    rows={4}
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary rounded-lg w-full min-h-24 max-h-48 resize-y px-3 py-2 text-sm"
                    style={{ minWidth: "180px" }}
                  />
                ) : f.type === "boolean" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      id={`field-${f.value}`}
                      checked={Boolean(formData[f.value])}
                      onCheckedChange={(checked) =>
                        setFormData((d) => ({ ...d, [f.value]: checked }))
                      }
                    />
                    <Label
                      htmlFor={`field-${f.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {f.label}
                    </Label>
                  </div>
                ) : f.type === "file" ? (
                  (!f.showWhen || formData[f.showWhen.field] === f.showWhen.value) ? (
                    <div className="space-y-1">
                      <Input
                        type="file"
                        accept={f.accept || ".pdf,.jpg,.jpeg,.png,.webp"}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData((d) => ({ ...d, [f.value]: file }));
                        }}
                        className="bg-muted/40 border-muted/30 text-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Anexe o comprovante em PDF, JPEG, PNG ou WebP (máx.
                        10MB).
                      </p>
                    </div>
                  ) : null
                ) : (
                  <Input
                    value={(formData[f.value] as string) ?? ""}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, [f.value]: e.target.value }))
                    }
                    className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={saving}
              onClick={async () => {
                if (!selectedItem) return;
                setSaving(true);
                try {
                  await onEdit(
                    { ...selectedItem, ...formData } as CrudItemType,
                    selectedItemKey
                  );
                  setEditOpen(false);
                } catch {
                  // Mantém o dialog aberto; o handler já notifica o erro.
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
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
              disabled={saving}
              onClick={async () => {
                if (!selectedItem) return;
                const itemId =
                  selectedItemKey || resolveItemKey(selectedItem);
                if (!itemId) return;
                setSaving(true);
                try {
                  await onDelete(itemId);
                  setDeleteOpen(false);
                } catch {
                  // Mantém o dialog aberto; o handler já notifica o erro.
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
