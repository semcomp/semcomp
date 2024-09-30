import { ReactNode, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Collapse,
  IconButton,
  TablePagination,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import { DeleteOutlineOutlined } from "@mui/icons-material";
import { EditOutlined } from "@mui/icons-material";
import Input, { InputType } from "../Input";
import { PaginationRequest, PaginationResponse } from "../../models/Pagination";
import { useAppContext } from "../../libs/contextLib";

function Row({
  index,
  row,
  onClick,
  onSelectChange,
  moreInfoContainer,
  onMoreInfoClick,
  renderCell, // Adiciona a propriedade renderCell
  actions,
}: {
  index: number;
  row: any;
  onClick: (index: number) => void;
  onSelectChange: (isSelected: boolean) => void;
  moreInfoContainer: ReactNode;
  onMoreInfoClick: (index: number) => void;
  renderCell?: (column: string, row: any) => ReactNode; // Propriedade opcional renderCell
  actions: {};
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [open, setOpen] = useState(false);
  const { adminRole } = useAppContext();

  function handleOnSelect() {
    onSelectChange(!isSelected);
    setIsSelected(!isSelected);
  }

  return (
    <>
      <TableRow
        hover={true}
        sx={{ "& > *": { borderBottom: "unset" } }}
        className="hover:cursor-pointer"
      >
        {moreInfoContainer && (
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => {
                setOpen(!open);
                onMoreInfoClick(index);
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
        {Object.keys(row).map((column: string, index: number) => (
          <TableCell key={index} onClick={() => onClick(index)}>
            {renderCell ? renderCell(column, row) : row[column]}{" "}
            {/* Usa renderCell se definido */}
          </TableCell>
        ))}
        {
          actions ? (
            <TableCell>
              <div className="inline-flex items-center flex-nowrap">
                {Object.keys(actions).map((action, index) => {
                  if (action === 'edit') {
                    return (
                      <IconButton key={index} onClick={actions[action]}>
                        <EditOutlined />
                      </IconButton>
                    );
                  } else if (action === 'delete' && adminRole.includes('DELETE')) {
                    return (
                      <IconButton key={index} onClick={() => actions[action](row)}>
                        <DeleteOutlineOutlined />
                      </IconButton>
                    );
                  }
                  return null;
                })}
              </div>
            </TableCell>

          ) : (
            null
          )
        }
      </TableRow>
      {moreInfoContainer && (
        <TableRow
          hover={true}
          onClick={() => onMoreInfoClick(index)}
          className="hover:cursor-pointer"
        >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>{moreInfoContainer}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

import { useMemo } from "react";

export default function DataTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
  renderCell,
  actions,
}: {
  data: PaginationResponse<any>;
  pagination: PaginationRequest;
  onRowClick: (index: number) => void;
  onRowSelect: (indexes: number[]) => void;
  moreInfoContainer?: ReactNode;
  onMoreInfoClick?: (index: number) => void;
  renderCell?: (column: string, row: any) => ReactNode;
  actions?: {};
}) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  function handleRowSelect(selectChangeIndex: number, isSelected: boolean) {
    let updatedSelectedRows = [...selectedRows];

    if (isSelected) {
      updatedSelectedRows.push(selectChangeIndex);
    } else {
      updatedSelectedRows = updatedSelectedRows.filter((index) => index !== selectChangeIndex);
    }

    setSelectedRows(updatedSelectedRows);
    onRowSelect(updatedSelectedRows);
  }

  function handleChangePage(
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) {
    pagination.setPage(newPage + 1);
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    pagination.setItems(parseInt(event.target.value, 10));
  }

  function handleSort(key: string) {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const sortedData = useMemo(() => {
    return [...data.getEntities()].sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;

      const isDate = (dateString: string) => {
        return /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/.test(dateString);
      };

      const parseDate = (dateString: string) => {
        const [datePart, timePart] = dateString.split(", ");
        const [day, month, year] = datePart.split("/").map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      };

      const valueA = isDate(a[key]) ? parseDate(a[key]) : a[key]?.toString().toLowerCase();
      const valueB = isDate(b[key]) ? parseDate(b[key]) : b[key]?.toString().toLowerCase();

      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter((row) => {
      return Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(filterQuery.toLowerCase())
      );
    });
  }, [sortedData, filterQuery]);

  const handleFilter = () => {
    setFilterQuery(searchQuery);
  };

  return (
    <>
      <Box
        sx={{ marginBottom: 2, display: 'flex' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFilter();
          }
        }}
      >
        <Input
          type={InputType.Text}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar..."
        />
        <IconButton onClick={handleFilter} aria-label="filter">
          <SearchIcon />
        </IconButton>
      </Box>
      {filterQuery && (
        <Box sx={{ marginBottom: 2 }}>
          {filteredData.length} items filtrados nessa página
        </Box>
      )}
      {data.getEntities()[0] && (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                {moreInfoContainer && <TableCell></TableCell>}
                <TableCell></TableCell>
                {Object.keys(data.getEntities()[0]).map((key: any, index: number) => {
                  return (
                    <TableCell key={index}>
                      {key}
                      <IconButton size="small" onClick={() => handleSort(key)}>
                        {sortConfig?.key === key && sortConfig.direction === 'asc' ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  );
                })}
                {actions && <TableCell>Ações</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <Row
                  key={index}
                  index={index}
                  row={row}
                  onClick={() => onRowClick(index)}
                  onSelectChange={(isSelected) => handleRowSelect(index, isSelected)}
                  moreInfoContainer={moreInfoContainer}
                  onMoreInfoClick={onMoreInfoClick}
                  renderCell={renderCell}
                  actions={actions}
                />
              ))}
            </TableBody>
          </Table>
          <TablePagination
            className="sticky left-0"
            component="div"
            count={data.getTotalNumberOfItems()}
            page={pagination.getPage() - 1}
            onPageChange={handleChangePage}
            rowsPerPage={pagination.getItems()}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
          />
        </TableContainer>
      )}
    </>
  );
}
