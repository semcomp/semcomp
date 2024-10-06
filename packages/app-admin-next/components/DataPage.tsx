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
            <h1 className='my-10 text-3xl font-bold text-gray-700'>{title}</h1>
          </Toolbar>
          <div className="flex items-center">
            {buttons}
          </div>
        </div>
        {isLoading ? <Spinner /> : table}
      </main>
    </div>
  );
}

export default DataPage;
