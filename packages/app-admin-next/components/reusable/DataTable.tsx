import { ReactNode, useEffect, useState } from "react";

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
import { DeleteOutlineOutlined } from "@mui/icons-material";
import { EditOutlined } from "@mui/icons-material";
import Input, { InputType } from "../Input";
import { PaginationRequest, PaginationResponse } from "../../models/Pagination";
import { useAppContext } from "../../libs/contextLib";
import { Modal } from "./Modal";
import { UserData } from "../../models/SemcompApiModels";

function Row({
  index,
  row,
  onClick,
  onSelectChange,
  moreInfoContainer,
  onMoreInfoClick,
  handleOpenKitModal,
  actions,
}: {
  index: number;
  row: UserData;
  onClick: (index: number) => void;
  onSelectChange: (isSelected: boolean) => void;
  moreInfoContainer: ReactNode;
  onMoreInfoClick: (index: number) => void;
  handleOpenKitModal: () => void;
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
              onClick={() => { setOpen(!open); onMoreInfoClick(index) }}
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
        {Object.values(row).map((value: any, index: number) => {
          // se for um booleano, então crio um input
          return (
            <TableCell key={index} onClick={() => onClick(index)}>
              {typeof (value) === 'boolean' &&
                (row["Opção de compra"] === "Kit" || row["Opção de compra"] === "Coffee") &&
                (row["Status do pagamento"] === "Aprovado") ? <Input
                className="my-3"
                onChange={handleOpenKitModal}
                value={row["Retirou Kit"]}
                type={InputType.Checkbox}
              /> : value}
            </TableCell>
          );
        })}
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

export default function DataTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
  actions,
  updateKitStatus,
}: {
  data: PaginationResponse<UserData>;
  pagination: PaginationRequest;
  onRowClick: (index: number) => void;
  onRowSelect: (indexes: number[]) => void;
  moreInfoContainer?: ReactNode;
  onMoreInfoClick?: (index: number) => void;
  actions?: {},
  updateKitStatus: (id: string, status: boolean) => any;
}) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isKitModalOpen, setKitModalOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState(null);

  const handleOpenKitModal = () => {
    setKitModalOpen(true);
  }
  const handleCloseKitModal = () => {
    setKitModalOpen(false);
  }
  const handleSubmit = async (index: number) => {
    data.getEntities()[index]["Retirou Kit"] = !data.getEntities()[index]["Retirou Kit"];
    const response = await updateKitStatus(data.getEntities()[index].ID, data.getEntities()[index]["Retirou Kit"]);
    console.log(response);
    handleCloseKitModal();
  }

  function handleRowSelect(selectChangeIndex: number, isSelected: boolean) {
    let updatedSelectedRows = selectedRows;

    if (isSelected) {
      updatedSelectedRows.push(selectChangeIndex);
    } else {
      updatedSelectedRows = updatedSelectedRows.filter((index) => {
        return index !== selectChangeIndex;
      });
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

  return (
    <>
      <Modal
        isOpen={isKitModalOpen}
        hasCloseBtn={false}
        onClose={handleCloseKitModal}>
        <div className="flex flex-col gap-5">
          Confirmar mudança?
          <div className="flex justify-between">
            <button className="bg-green-600 text-white py-2 px-4 hover:bg-green-800" onClick={() =>
              handleSubmit(selected)}>
              Sim
            </button>
            <button className="bg-red-600 text-white py-2 px-4 hover:bg-red-800" onClick={handleCloseKitModal}>
              Não
            </button>
          </div>
        </div>
      </Modal>

      {data.getEntities()[0] && (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                {moreInfoContainer && <TableCell></TableCell>}
                <TableCell></TableCell>
                {Object.keys(data.getEntities()[0]).map(
                  (key: any, index: number) => {
                    return <TableCell key={index}>{key}</TableCell>;
                  }
                )}
                {actions && (
                  <TableCell>Ações</TableCell>
                )
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {data.getEntities().map((row, index) => (
                <Row
                  key={index}
                  index={index}
                  row={row}
                  onClick={() => {
                    onRowClick(index);
                    setSelected(index);
                  }}
                  onSelectChange={(isSelected) =>
                    handleRowSelect(index, isSelected)
                  }
                  moreInfoContainer={moreInfoContainer}
                  onMoreInfoClick={onMoreInfoClick}
                  handleOpenKitModal={handleOpenKitModal}
                  actions={actions}
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
      )}
    </>
  );
}
