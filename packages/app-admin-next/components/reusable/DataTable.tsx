import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Toolbar } from '@mui/material';

function Row({row}: {row: any}) {
  return (<>
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      {Object.values(row).map((value: any, index: number) => {
        return (<TableCell key={index} align="right">{value}</TableCell>);
      })}
    </TableRow>
  </>);
}

export default function DataTable({
  title, data
}: {
  title: string, data: object[]
}) {
  return (<>
    <Toolbar>
      <h1 className='text-xl'>{title}</h1>
    </Toolbar>
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            {Object.keys(data[0]).map((key: any, index: number) => {
              return (<TableCell key={index} align="right">{key}</TableCell>);
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row key={index} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>);
}
