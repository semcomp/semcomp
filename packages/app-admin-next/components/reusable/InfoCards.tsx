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
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import Input, { InputType } from "../Input";
import { PaginationRequest, PaginationResponse } from "../../models/Pagination";

type InfoData = {
  "infoTitle": string,
  "infoValue": number,
}

export default function InfoCards({
  className,
  infoData,
}: {
  infoData: InfoData[],
  className?: string
}) {
  return(
    <>
      <div className={`grid lg:grid-cols-4 mb-10 gap-5 w-full sm:grid-cols-2 ${className}`}>
    {
      infoData.map((info) => (
        <div key={info.infoTitle} className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
            <h5 className="mb-2 text-2xl font-bold text-gray-700">{info.infoTitle}</h5>
            <p className="font-normal text-gray-700">{info.infoValue}</p>
        </div>
      ))
    }
        {/* <div className="bg-amber-500 w-20 mb-2">
          {info.infoTitle}
        </div> */}
    </div>
    </>
  )
}
