import { ReactNode, useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Collapse, IconButton, TablePagination, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import Input, { InputType } from '../Input';
import { PaginationRequest, PaginationResponse } from '../../models/Pagination';

function Row({
  index,
  row,
  onClick,
  onSelectChange,
  moreInfoContainer,
  onMoreInfoClick,
}: {
  index: number,
  row: any,
  onClick: (index: number) => void,
  onSelectChange: (isSelected: boolean) => void,
  moreInfoContainer: ReactNode,
  onMoreInfoClick: (index: number) => void,
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [open, setOpen] = useState(false);

  function handleOnSelect() {
    onSelectChange(!isSelected);
    setIsSelected(!isSelected);
  }

  return (<>
    <TableRow
      hover={true}
      sx={{ '& > *': { borderBottom: 'unset' } }}
      className="hover:cursor-pointer"
    >
      {
        moreInfoContainer && (<TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>)
      }
      <TableCell>
        <Input
          className="my-3"
          onChange={handleOnSelect}
          value={isSelected}
          type={InputType.Checkbox}
        />
      </TableCell>
      {Object.values(row).map((value: any, index: number) => {
        return (<TableCell key={index} onClick={() => onClick(index)}>{value}</TableCell>);
      })}
    </TableRow>
    {
      moreInfoContainer && (<TableRow
        hover={true}
        onClick={() => onMoreInfoClick(index)}
        className="hover:cursor-pointer"
      >
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {moreInfoContainer}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>)
    }
  </>);
}

export default function DataTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
}: {
  data: PaginationResponse<any>,
  pagination: PaginationRequest,
  onRowClick: (index: number) => void,
  onRowSelect: (indexes: number[]) => void,
  moreInfoContainer?: ReactNode,
  onMoreInfoClick?: (index: number) => void,
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
              { moreInfoContainer && <TableCell></TableCell>}
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
                index={index}
                row={row}
                onClick={() => onRowClick(index)}
                onSelectChange={(isSelected) => handleRowSelect(index, isSelected)}
                moreInfoContainer={moreInfoContainer}
                onMoreInfoClick={onMoreInfoClick}
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
          rowsPerPageOptions={[2, 5, 10, 25, 50, 100]}
        />
      </TableContainer>
    }
  </>);
}
