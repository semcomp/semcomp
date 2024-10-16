import { forwardRef, ReactNode, useEffect, useImperativeHandle, useState, useMemo } from "react";

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
import Input, { InputType } from "../Input";
import { PaginationRequest, PaginationResponse } from "../../models/Pagination";
import { useAppContext } from "../../libs/contextLib";
import { DeleteOutlineOutlined, EditOutlined } from "@mui/icons-material";

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
}: {
  index: number;
  row: any;
  onClick: (index: number) => void;
  onSelectChange: (isSelected: boolean) => void;
  _isSelected: boolean;
  moreInfoContainer: ReactNode;
  isOpen: boolean;
  onMoreInfoClick: (index: number) => void;
  renderCell?: (column: string, row: any) => ReactNode;
  actions?: {};
}) {
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
        {Object.keys(row).map((column: string, index: number) => (
          <TableCell key={index} onClick={() => onClick(index)}>
            {renderCell ? renderCell(column, row) : row[column]}{" "}
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
                  } else if (action.toLowerCase() === 'delete' && adminRole.includes('DELETE')) {
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
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>{moreInfoContainer}</Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

const DataTable = forwardRef(({
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
}, dataTableRef?) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  function handleRowSelect(selectChangeIndex: number, isSelected: boolean) {
    let updatedSelectedRows = [...selectedRows];

    if (isSelected) {
      updatedSelectedRows = [...selectedRows, selectChangeIndex];
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

  function handleSelectAll(status?: boolean) {
    const newStatus = typeof status === "boolean" ? status : !selectAll;
    setSelectAll(newStatus);
    const selectedRows = !newStatus ? [] : data.getEntities().map((_, index) => index);
    setSelectedRows(selectedRows);
    onRowSelect(selectedRows);
  }

  useImperativeHandle(dataTableRef, () => ({
    handleSelectAll,
  }));

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

      const isNumber = (value: any) => {
        return !isNaN(value);
      };

      const valueA = isDate(a[key]) ? parseDate(a[key]) : isNumber(a[key]) ? parseFloat(a[key]) : a[key]?.toString().toLowerCase();
      const valueB = isDate(b[key]) ? parseDate(b[key]) : isNumber(b[key]) ? parseFloat(b[key]) : b[key]?.toString().toLowerCase();
      
      if (valueA === "" || valueA === null || valueA === undefined || Number.isNaN(valueA)) return 1;
      if (valueB === "" || valueB === null || valueB === undefined || Number.isNaN(valueB)) return -1;

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

  const findOriginalIndex = (filteredIndex: number) => {
    const filteredRow = filteredData[filteredIndex];
    return data.getEntities().findIndex(row => row === filteredRow);
  };

  const handleOnRowClick = (filteredIndex: number) => {
    const originalIndex = findOriginalIndex(filteredIndex);
    onRowClick(originalIndex);
  }

  const handleMoreInfoClick = (filteredIndex: number) => {
    const originalIndex = findOriginalIndex(filteredIndex);
    setOpenRowIndex(openRowIndex === filteredIndex ? null : filteredIndex);
    if (onMoreInfoClick) {
      onMoreInfoClick(originalIndex);
    }
  };

  return (
    <>
      <Box className="w-full flex flex-wrap content-end flex-col">
        <Box
          sx={{
            marginBottom: 2,
            display: "flex",
            justifyContent: { xs: "center", sm: "end" },
            width: { xs: "100%", sm: "30em" },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFilter();
            }
          }}
        >
          <Input
            className="w-9/12"
            type={InputType.Text}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar na página atual..."
          />
          <IconButton onClick={handleFilter} aria-label="filter">
          <SearchIcon />
            </IconButton>
          </Box>

          {filterQuery && (
            <Box 
              sx={{
                marginBottom: 2,
                display: "flex",
                justifyContent: "center",
                width: { xs: "100%", sm: "30em" },
                paddingLeft: { xs: "0em", sm: "2.5em" },
              }}
            >
              {filteredData.length} items filtrados nessa página
            </Box>
          )}
      </Box>

      {data.getEntities()[0] && (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
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
                  onClick={handleOnRowClick}
                  onSelectChange={(isSelected) => handleRowSelect(index, isSelected)}
                  _isSelected={selectedRows.includes(index)}
                  moreInfoContainer={moreInfoContainer}
                  isOpen={openRowIndex === index}
                  onMoreInfoClick={handleMoreInfoClick}
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
});

DataTable.displayName = 'DataTable';
export default DataTable;
