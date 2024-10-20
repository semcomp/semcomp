import { useEffect, useState } from 'react';
import {toast} from 'react-toastify';

import DataPage from "../components/DataPage";
import LoadingButton from '../components/reusable/LoadingButton';
import { useAppContext } from '../libs/contextLib';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { Accordion, AccordionDetails, AccordionSummary, FormControlLabel, FormGroup, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import { PaginationRequest } from '../models/Pagination';
import { PaymentStatus } from '../models/SemcompApiModels';
import InfoCards from '../components/reusable/InfoCards';

function Config() {
    const [isLoading, setIsLoading] = useState(false);
    const {
        semcompApi
    }: {
        semcompApi: SemcompApi
    } = useAppContext();
    
    const [openSales, setOpenSales] = useState(false);
    const [openSignup, setSignup] = useState(false);
    const [openAchievement, setOpenAchievement] = useState(false);
    const [enableWantNameTag, setEnableWantNameTag] = useState(false);
    const [status, setStatus] = useState({
        openSales: false,
        openSignup: false,
        openAchievement: false,
        enableWantNameTag: false,
    });
    const [totalPaid, setTotalPaid] = useState(0);
    const [infoData, setInfoData] = useState([]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const config = await semcompApi.getConfig();
            setOpenSales(config.openSales);
            setSignup(config.openSignup);
            setOpenAchievement(config.openAchievement);
            setEnableWantNameTag(config.enableWantNameTag);

            const payments = await semcompApi.getPayments();
            const total = Array.isArray(payments) ? payments.reduce((count, cur) =>
                count + ((cur.status === PaymentStatus.APPROVED && cur.price) ? cur.price : 0)
            , 0) : 0;
            
            setInfoData([{
                infoTitle: "Total arrecadado",
                infoValue: total
            }])
        } catch (error) {
            toast.error('Erro ao buscar dados de configuração :(');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleSubmit() {
        try {
            setIsLoading(true);
            const config = {
                openSales: openSales,
                openAchievement: openAchievement,
                openSignup: openSignup,
                enableWantNameTag: enableWantNameTag,
            }

            setStatus({
                openSales: false,
                openAchievement: false,
                openSignup: false,
                enableWantNameTag: false,
            });
            
            await semcompApi.updateConfig(config);
            toast.success('Salvo com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro no servidor!');
        } finally {
            setIsLoading(false);
        }
    }

    const AccordionTitle: React.FC<{ title: string; modified: boolean }> = ({ title, modified }) => {
        return (
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id={`accordion${title}-header`}
            >
                {title} {modified && <CircleIcon fontSize='small' style={{ color: 'lightblue', marginLeft: '8px' }} />}
            </AccordionSummary>
        );
    }
    return (
        <DataPage
            title="Configurações"
            isLoading={isLoading}
            table={
                <div className='w-full flex flex-col items-center'>
                    <InfoCards
                        infoData={infoData}
                    />
                    <Accordion style={{ width: '50%' }}>
                        <AccordionTitle
                            title="Vendas e Inscrições"
                            modified={status.openSales || status.openSignup || status.enableWantNameTag}
                        />

                        <AccordionDetails>
                            <FormGroup>
                                <FormControlLabel 
                                    control = {
                                        <Switch 
                                            checked={openSales}
                                            onChange={() => {
                                                setOpenSales(!openSales);
                                                setStatus({ ...status, openSales: !status.openSales });
                                            }}
                                        />
                                    }
                                    label="Vendas abertas"
                                />
                                <FormControlLabel 
                                    control = {
                                        <Switch 
                                            checked={openSignup} 
                                            onChange={() => {
                                                setSignup(!openSignup);
                                                setStatus({ ...status, openSignup: !status.openSignup });
                                            }}
                                        />
                                    }
                                    label="Inscrições abertas"
                                />
                            </FormGroup>
                            <FormControlLabel 
                                    control = {
                                        <Switch 
                                            checked={enableWantNameTag} 
                                            onChange={() => {
                                                setEnableWantNameTag(!enableWantNameTag);
                                                setStatus({ ...status, enableWantNameTag: !status.enableWantNameTag });
                                            }}
                                        />
                                    }
                                    label="Exibir modal para requisição dos crachás"
                                />
                        </AccordionDetails>
                    </Accordion>

                    <Accordion style={{ width: '50%' }}>
                        <AccordionTitle
                            title="Conquistas"
                            modified={status.openAchievement}
                        />

                        <AccordionDetails>
                            <FormGroup>
                                <FormControlLabel 
                                    control = {
                                        <Switch 
                                            checked={openAchievement}
                                            onChange={() => {
                                                setOpenAchievement(!openAchievement);
                                                setStatus({ ...status, openAchievement: !status.openAchievement });
                                            }}
                                        />
                                    } 
                                    label="Abrir Conquistas" />
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>

                    <LoadingButton
                        isLoading={isLoading}
                        style={{ marginTop: '1rem', backgroundColor: '#4CAF50', color: 'white' }}
                        onClick={handleSubmit}
                    >
                        Salvar alterações
                    </LoadingButton>
                </div>
            }
        >
        </DataPage>
    );
}

export default RequireAuth(Config, "CONFIG");
