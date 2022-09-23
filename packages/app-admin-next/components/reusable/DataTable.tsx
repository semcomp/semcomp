import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TablePagination } from '@mui/material';

import Input, { InputType } from '../Input';
import { PaginationRequest, PaginationResponse } from '../../models/Pagination';

function Row({
  row,
  onClick,
  onSelectChange,
}: {
  row: any,
  onClick: () => void,
  onSelectChange: (isSelected: boolean) => void,
}) {
  const [isSelected, setIsSelected] = useState(false);

  function handleOnSelect() {
    onSelectChange(!isSelected);
    setIsSelected(!isSelected);
  }

  return (<>
    <TableRow
      hover={true}
      onClick={() => onClick()}
      className="hover:cursor-pointer"
    >
      <TableCell>
        <Input
          className="my-3"
          onChange={handleOnSelect}
          value={isSelected}
          type={InputType.Checkbox}
        />
      </TableCell>
      {Object.values(row).map((value: any, index: number) => {
        return (<TableCell key={index}>{value}</TableCell>);
      })}
    </TableRow>
  </>);
}

export default function DataTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<any>,
  pagination: PaginationRequest,
  onRowClick: (index: number) => void,
  onRowSelect: (indexes: number[]) => void,
}) {
  const [selectedRows, setSelectedRows] = useState([]);

  function handleRowSelect(selectChangeIndex: number, isSelected: boolean) {
    let updatedSelectedRows = selectedRows;

    if (isSelected) {
      updatedSelectedRows.push(selectChangeIndex);
    } else {
      updatedSelectedRows = updatedSelectedRows.filter((index) => {
        return index !== selectChangeIndex;
      })
    }

    setSelectedRows(updatedSelectedRows);
    onRowSelect(updatedSelectedRows);
  }

  function handleChangePage(
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    pagination.setPage(newPage + 1);
  };

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    pagination.setItems(parseInt(event.target.value, 10));
  };

  return (<>
    {
      data.getEntities()[0] &&
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {Object.keys(data.getEntities()[0]).map((key: any, index: number) => {
                return (<TableCell key={index}>{key}</TableCell>);
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.getEntities().map((row, index) => (
              <Row
                key={index}
                row={row}
                onClick={() => onRowClick(index)}
                onSelectChange={(isSelected) => handleRowSelect(index, isSelected)}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.getTotalNumberOfItems()}
          page={pagination.getPage() - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.getItems()}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    }
  </>);
}
