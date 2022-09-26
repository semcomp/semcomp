import { ReactNode } from "react";

import { Toolbar } from "@mui/material";

import Sidebar from "./layout/Sidebar";
import Spinner from "./reusable/Spinner";

function DataPage({
  title,
  isLoading,
  buttons,
  table,
}: {
  title: string,
  isLoading: boolean,
  buttons?: ReactNode,
  table: ReactNode,
}) {
  return (
    <div className="min-h-full w-full flex">
      <Sidebar />
      <main className="flex flex-col justify-center items-center w-full h-full p-4 py-16">
        <div className='w-full flex justify-between'>
          <Toolbar>
            <h1 className='text-xl'>{title}</h1>
          </Toolbar>
          {buttons}
        </div>
        {isLoading ? <Spinner /> : table}
      </main>
    </div>
  );
}

export default DataPage;
