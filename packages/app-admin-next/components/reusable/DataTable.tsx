import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Toolbar } from '@mui/material';
import { useState } from 'react';
import Input, { InputType } from '../Input';

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
  onRowClick,
  onRowSelect,
}: {
  data: object[],
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

  return (<>
    {
      data[0] &&
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {Object.keys(data[0]).map((key: any, index: number) => {
                return (<TableCell key={index}>{key}</TableCell>);
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <Row
                key={index}
                row={row}
                onClick={() => onRowClick(index)}
                onSelectChange={(isSelected) => handleRowSelect(index, isSelected)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    }
  </>);
}
