import {
    forwardRef,
    ReactNode,
    useEffect,
    useImperativeHandle,
    useState,
    useMemo,
} from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Box,
    Collapse,
    IconButton,
    TablePagination,
    CircularProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import { DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';
import Input, { InputType } from '../Input';
import { useAppContext } from '../../libs/contextLib';
import { PaginationRequest, PaginationResponse } from '../../models/Pagination';

type ColumnDef<T = any> = {
    key: string;
    label: string;
    render?: (row: T, updateRow: (newRowData: Partial<T>) => void) => ReactNode; // Adicionando 'updateRow'
    value?: (row: T) => any;
}


type FetchFunction<T> = (params: {
    page: number;
    limit: number;
    search?: string;
    sort?: { key: string; direction: 'asc' | 'desc' } | null;
}) => Promise<PaginationResponse<T>>;

function Row({
    index,
    row,
    onClick,
    onSelectChange,
    _isSelected,
    moreInfoContainer,
    isOpen,
    onMoreInfoClick,
    renderCell,
    actions,
}: any) {
    const [isSelected, setIsSelected] = useState(_isSelected);
    const { adminRole } = useAppContext();

    useEffect(() => {
        setIsSelected(_isSelected);
    }, [_isSelected]);

    function handleOnSelect() {
        onSelectChange(!isSelected);
        setIsSelected(!isSelected);
    }

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                {moreInfoContainer && (
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => onMoreInfoClick(index)}
                        >
                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                )}
                <TableCell>
                    <Input
                        className="my-3"
                        onChange={handleOnSelect}
                        value={isSelected}
                        type={InputType.Checkbox}
                    />
                </TableCell>
                {Object.keys(row).map((column: string, i: number) => (
                    <TableCell key={i} onClick={() => onClick(index)}>
                        {renderCell ? renderCell(column, row) : row[column]}
                    </TableCell>
                ))}
                {actions ? (
                    <TableCell>
                        <div className="inline-flex items-center flex-nowrap">
                            {Object.keys(actions).map((action, i) => {
                                if (action === 'edit') {
                                    return (
                                        <IconButton key={i} onClick={actions[action]}>
                                            <EditOutlined />
                                        </IconButton>
                                    );
                                } else if (
                                    action.toLowerCase() === 'delete' &&
                                    adminRole.includes('DELETE')
                                ) {
                                    return (
                                        <IconButton
                                            key={i}
                                            onClick={() => actions[action](row)}
                                        >
                                            <DeleteOutlineOutlined />
                                        </IconButton>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </TableCell>
                ) : null}
            </TableRow>
            {moreInfoContainer && (
                <TableRow hover onClick={() => onMoreInfoClick(index)}>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>{moreInfoContainer}</Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

const DataTable = forwardRef(
    (
        {
            fetchData,
            columns,
            onRowClick,
            onRowSelect,
            moreInfoContainer,
            onMoreInfoClick,
            renderCell,
            actions,
            initialPage = 1,
            initialLimit = 10,
        }: {
            fetchData: FetchFunction<any>;
            columns: ColumnDef[];
            onRowClick: (row: any) => void;
            onRowSelect: (indexes: number[]) => void;
            moreInfoContainer?: ReactNode;
            onMoreInfoClick?: (index: number) => void;
            renderCell?: (column: string, row: any) => ReactNode;
            actions?: {};
            initialPage?: number;
            initialLimit?: number;
        },
        ref
    ) => {
        const [rows, setRows] = useState<any[]>([]);
        const [totalItems, setTotalItems] = useState(0);
        const [page, setPage] = useState(initialPage);
        const [limit, setLimit] = useState(initialLimit);
        const [loading, setLoading] = useState(false);
        const [selectedRows, setSelectedRows] = useState<number[]>([]);
        const [selectAll, setSelectAll] = useState(false);
        const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
        const [searchQuery, setSearchQuery] = useState('');
        const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

        async function loadData() {
            setLoading(true);
            try {
                const response = await fetchData({
                    page,
                    limit,
                    search: searchQuery,
                    sort: sortConfig,
                });
                console.log('response', response);
                setRows(response.getEntities());
                setTotalItems(response.getTotalNumberOfItems());
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            } finally {
                setLoading(false);
            }
        }

        const handleLocalRowUpdate = (rowIndex, updatedFields) => {
            const rowToUpdate = rows[rowIndex];
            if (!rowToUpdate) return;
    
            const newRows = rows.map((row, i) =>
                i === rowIndex ? { ...row, ...updatedFields } : row
            );
            setRows(newRows);
        };

        useEffect(() => {
            loadData();
        }, [page, limit, sortConfig, searchQuery]);

        useImperativeHandle(ref, () => ({
            reload: loadData,
        }));

        function handleSort(key: string) {
            let direction: 'asc' | 'desc' = 'asc';
            if (sortConfig?.key === key && sortConfig.direction === 'asc') {
                direction = 'desc';
            }
            setSortConfig({ key, direction });
        }

        function handleSelectAll(status?: boolean) {
            const newStatus = typeof status === 'boolean' ? status : !selectAll;
            setSelectAll(newStatus);
            const selected = !newStatus ? [] : rows.map((_, i) => i);
            setSelectedRows(selected);
            onRowSelect(selected);
        }

        function handleRowSelect(index: number, isSelected: boolean) {
            const updated = isSelected
                ? [...selectedRows, index]
                : selectedRows.filter((i) => i !== index);
            setSelectedRows(updated);
            onRowSelect(updated);
        }

        return (
            <>
                <Box className="w-full flex flex-wrap content-end flex-col">
                    <Box
                        sx={{
                            marginBottom: 2,
                            display: 'flex',
                            justifyContent: { xs: 'center', sm: 'end' },
                            width: { xs: '100%', sm: '30em' },
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') loadData();
                        }}
                        >
                        <Input
                            className="w-9/12"
                            type={InputType.Text}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                        />
                        <IconButton
                            onClick={loadData}
                            aria-label="filter"
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>
                </Box>

                {loading ? (
                    <Box className="flex justify-center py-6">
                        <CircularProgress />
                    </Box>
                ) : rows?.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {moreInfoContainer && <TableCell></TableCell>}
                                    <TableCell>
                                        <Input
                                            onChange={handleSelectAll}
                                            value={selectAll}
                                            type={InputType.Checkbox}
                                        />
                                    </TableCell>
                                    {columns.map((col, i) => (
                                        <TableCell key={i}>
                                            {col.label}
                                            <IconButton size="small" onClick={() => handleSort(col.key)}>
                                                {sortConfig?.key === col.key && sortConfig.direction === 'asc' ? (
                                                    <KeyboardArrowUpIcon />
                                                ) : (
                                                    <KeyboardArrowDownIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                    ))}
                                    {actions && <TableCell>Ações</TableCell>}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow key={index} onClick={() => onRowClick(row)}>  
                                        {moreInfoContainer && <TableCell></TableCell>}
                                        <TableCell>
                                            <Input
                                                onChange={() =>
                                                    handleRowSelect(index, !selectedRows.includes(index))
                                                }
                                                value={selectedRows.includes(index)}
                                                type={InputType.Checkbox}
                                            />
                                        </TableCell>
                                        {columns.map((col, i) => {
                                            // Função para que o componente dentro do 'render' possa atualizar a linha
                                            const updateSpecificRow = (updatedFields) => {
                                                handleLocalRowUpdate(index, updatedFields);
                                                // O recarregamento dos dados (loadData) deve ser acionado pelo UsersTable 
                                                // após a chamada de API ser finalizada.
                                            };

                                            return (
                                                <TableCell key={i}>
                                                    {col.render ? (
                                                        // **AQUI ESTÁ A MUDANÇA PRINCIPAL:** Passamos a função de atualização
                                                        col.render(row, updateSpecificRow) 
                                                    ) : col.value ? (
                                                        col.value(row)
                                                    ) : (
                                                        row[col.key]
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        {actions && (
                                            <TableCell>
                                                <div className="inline-flex items-center flex-nowrap">
                                                    {Object.keys(actions).map((action, i) => (
                                                        <IconButton key={i} onClick={() => actions[action](row)}>
                                                            {action === 'edit' ? (
                                                                <EditOutlined />
                                                            ) : action.toLowerCase() === 'delete' ? (
                                                                <DeleteOutlineOutlined />
                                                            ) : null}
                                                        </IconButton>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={totalItems}
                            page={page - 1}
                            onPageChange={(_, newPage) => setPage(newPage + 1)}
                            rowsPerPage={limit}
                            onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
                            rowsPerPageOptions={[2, 10, 25, 50, 100, 200, 500]}
                            labelRowsPerPage="Itens por página"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        />
                    </TableContainer>
                ) : (
                    <Box className="text-center py-6">Nenhum dado encontrado</Box>
                )}
            </>
        );
    }
);

DataTable.displayName = 'DataTable';
export { DataTable };
