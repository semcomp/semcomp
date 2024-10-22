// import React, { useEffect, useState } from 'react';
// import SemcompApi from '../api/semcomp-api';
// import DataPage from '../components/DataPage';
// import { PaginationRequest, PaginationResponse } from '../models/Pagination';
// import { toast } from 'react-toastify';
// import DataTable from '../components/reusable/DataTable';
// import util from '../libs/util';
// import { SemcompApiGameConfig } from '../models/SemcompApiModels';


// type LogData = {
//     type: string,
//     collectionName: string,
//     user: string,
//     id: string,
//     objectBefore: string,
//     objectAfter: string,
//     createdAt: string,
// };

  
// function GameConfigTable({
// data,
// pagination,
// onRowClick,
// onRowSelect,
// actions,
// }: {
// data: PaginationResponse<SemcompApiGameConfig>,
// pagination: PaginationRequest,
// onRowClick: (selectedIndex: number) => void,
// onRowSelect: (selectedIndexes: number[]) => void,
// actions?: {},
// }) {
// const newData: GameConfigData[] = [];
// for (const game of data.getEntities()) {
//     const description = game.description.length > 150 ?
//     game.description.slice(0, 150) + "..."
//     :
//     game.description;

//     const rules = game.rules.length > 150 ?
//     game.rules.slice(0, 150) + "..."
//     :
//     game.rules;

//     newData.push({
//     "ID": game.id,
//     "Jogo": game.game,
//     "Descrição": description,
//     "Regras": rules,
//     "Data de início": util.formatDate(game.startDate),
//     "Data de fim": util.formatDate(game.endDate),
//     "Tem grupos": <Input onChange={() => {}} disabled={true} value={game.hasGroups} type={InputType.Checkbox}></Input>,
//     "Máximo de membros": game.maximumNumberOfMembersInGroup,
//     "Criado em": util.formatDate(game.createdAt),
//     "Editado em": util.formatDate(game.updatedAt),
//     })
// }

// return (<DataTable
//     data={new PaginationResponse<GameConfigData>(newData, data.getTotalNumberOfItems())}
//     pagination={pagination}
//     onRowClick={onRowClick}
//     onRowSelect={onRowSelect}
//     actions={actions}
// ></DataTable>);
// }

// function Logs() {
//     const [data, setData] = useState<PaginationResponse<LogData> | null>(null);
//     const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
//     const [isLoading, setIsLoading] = useState(true);

//     async function fetchData() {
//         try {
//             setIsLoading(true);
//             const response = await SemcompApi.getAllLogs(pagination);
//             setData(response);
//         } catch (error) {
//             console.error(error);
//             toast.error('Erro ao carregar logs');
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const columns = [
//         { name: 'type', label: 'Type', options: { filter: true, sort: false } },
//         { name: 'collectionName', label: 'Collection Name', options: { filter: true, sort: false } },
//         { name: 'user', label: 'User ID', options: { filter: true, sort: false } },
//         { name: 'id', label: 'id', options: { filter: false, sort: true, display: false } },
//         { name: 'objectBefore', label: 'Object Before', options: { filter: false, sort: true, display: false } },
//         { name: 'objectAfter', label: 'Object After', options: { filter: false, sort: true, display: false } },
//         {
//             name: 'createdAt',
//             label: 'Created At',
//             options: {
//                 filter: false,
//                 sort: true,
//                 customBodyRenderLite: (dataIndex) => <RenderDate date={data?.getEntities()[dataIndex].createdAt} />,
//             },
//         },
//     ];

//     return (
//         <div className={styles.root}>
//             <div className={styles.main}>
//                 <DataPage
//                     title="Logs"
//                     isLoading={isLoading}
//                     data={data.getEntities()}
//                     pagination={pagination}
//                     columns={columns}
//                     fetchData={fetchData}
//                 />
//             </div>
//         </div>
//     );
// }

// export default Logs;
