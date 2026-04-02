import type { CrudItemType } from "@/types/CrudItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Plus, Pencil, Trash2, X } from "lucide-react";

export interface CrudField {
  value: string;
  label: string;
  type?: "text" | "badge" | "date" | "number";
  badgeVariants?: Record<string, string>; // value -> className
}

export interface CrudTableProps {
  data: CrudItemType[];
  fields: CrudField[];
  onEdit: (item: CrudItemType) => void;
  onDelete: (id: string) => void;
  onCreate?: (item: CrudItemType) => void;
  entityLabel?: string;
}

export function CrudTable({ data, fields, onEdit, onDelete, onCreate, entityLabel = "item" }: CrudTableProps) {
  const [filter, setFilter] = useState("");
  const [filterField, setFilterField] = useState(fields[0]?.value ?? "name");
  const [sortField, setSortField] = useState(fields[0]?.value ?? "name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CrudItemType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(o => o === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...data];
    if (filter.trim()) {
      result = result.filter(item => {
        const val = String((item as Record<string, unknown>)[filterField] ?? "").toLowerCase();
        return val.includes(filter.toLowerCase());
      });
    }
    result.sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortField] ?? "");
      const bv = String((b as Record<string, unknown>)[sortField] ?? "");
      return sortOrder === "asc" ? av.localeCompare(bv, "pt-BR") : bv.localeCompare(av, "pt-BR");
    });
    return result;
  }, [data, filter, filterField, sortField, sortOrder]);

  const openEdit = (item: CrudItemType) => {
    setSelectedItem(item);
    const fd: Record<string, string> = {};
    fields.forEach(f => { fd[f.value] = String((item as Record<string, unknown>)[f.value] ?? ""); });
    setFormData(fd);
    setEditOpen(true);
  };

  const openDelete = (item: CrudItemType) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  const openCreate = () => {
    const fd: Record<string, string> = {};
    fields.forEach(f => { fd[f.value] = ""; });
    setFormData(fd);
    setCreateOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="inline ml-1 w-3.5 h-3.5 opacity-30" />;
    return sortOrder === "asc"
      ? <ChevronUp className="inline ml-1 w-3.5 h-3.5 text-sky-400" />
      : <ChevronDown className="inline ml-1 w-3.5 h-3.5 text-sky-400" />;
  };

  const renderCell = (item: CrudItemType, field: CrudField) => {
    const val = String((item as Record<string, unknown>)[field.value] ?? "—");
    if (field.type === "badge" && field.badgeVariants) {
      const cls = field.badgeVariants[val] ?? "bg-slate-700 text-slate-200";
      return <Badge className={`text-xs font-medium px-2 py-0.5 ${cls}`}>{val}</Badge>;
    }
    return <span className="text-slate-200">{val}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Ferramentas [FiltroPorCampo/Criação] */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-1 w-full">
          <Select value={filterField} onValueChange={val => { setFilterField(val); }}>
            <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-slate-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {fields.map(f => (
                <SelectItem key={f.value} value={f.value} className="text-slate-200 focus:bg-slate-700">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder={`Filtrar por ${fields.find(f => f.value === filterField)?.label ?? "campo"}…`}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-sky-500"
            />
            {filter && (
              <button onClick={() => setFilter("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {onCreate && (
          <Button
            onClick={openCreate}
            className="bg-sky-600 hover:bg-sky-500 text-white rounded-xl gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo {entityLabel}
          </Button>
        )}
      </div>

      {/* Tabela genérica */}
      <div className="rounded-xl border border-slate-800 overflow-hidden scrollbar-hide">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 bg-slate-800/60 hover:bg-slate-800/60">
              {fields.map(f => (
                <TableHead
                  key={f.value}
                  className="cursor-pointer select-none text-slate-400 text-xs font-semibold uppercase tracking-wider hover:text-sky-300 transition-colors"
                  onClick={() => handleSort(f.value)}
                >
                  {f.label}
                  <SortIcon field={f.value} />
                </TableHead>
              ))}
              <TableHead className="text-slate-400 text-xs font-semibold uppercase tracking-wider w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 1} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-30" />
                    <p>Nenhum resultado encontrado</p>
                    {filter && <button onClick={() => setFilter("")} className="text-sky-400 hover:text-sky-300 text-sm">Limpar filtro</button>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow
                  key={item.id}
                  className={`border-slate-800 transition-colors hover:bg-slate-800/50 ${i % 2 === 0 ? "bg-transparent" : "bg-slate-900/30"}`}
                >
                  {fields.map(f => (
                    <TableCell key={f.value} className="py-3">
                      {renderCell(item, f)}
                    </TableCell>
                  ))}
                  <TableCell className="py-3">
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(item)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDelete(item)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Novo {entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <Label htmlFor={`create-${f.value}`} className="text-slate-300 text-sm">{f.label}</Label>
                {f.type === "badge" && f.badgeVariants ? (
                  <Select value={formData[f.value]} onValueChange={v => setFormData(d => ({ ...d, [f.value]: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder={`Selecionar ${f.label}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.keys(f.badgeVariants).map(v => (
                        <SelectItem key={v} value={v} className="text-slate-200 focus:bg-slate-700">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`create-${f.value}`}
                    value={formData[f.value] ?? ""}
                    onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-sky-500"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-slate-400">Cancelar</Button>
            <Button
              className="bg-sky-600 hover:bg-sky-500"
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar {entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map(f => (
              <div key={f.value} className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{f.label}</Label>
                {f.type === "badge" && f.badgeVariants ? (
                  <Select value={formData[f.value]} onValueChange={v => setFormData(d => ({ ...d, [f.value]: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.keys(f.badgeVariants).map(v => (
                        <SelectItem key={v} value={v} className="text-slate-200 focus:bg-slate-700">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formData[f.value] ?? ""}
                    onChange={e => setFormData(d => ({ ...d, [f.value]: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-sky-500"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)} className="text-slate-400">Cancelar</Button>
            <Button
              className="bg-sky-600 hover:bg-sky-500"
              onClick={() => {
                if (selectedItem) onEdit({ ...selectedItem, ...formData } as CrudItemType);
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm py-2">
            Tem certeza que deseja excluir <span className="text-white font-medium">"{selectedItem?.name}"</span>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-slate-400">Cancelar</Button>
            <Button
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-500"
              onClick={() => {
                if (selectedItem) onDelete(selectedItem.id);
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