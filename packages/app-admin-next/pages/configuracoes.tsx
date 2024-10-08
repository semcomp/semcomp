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

    const [isSalesModified, setIsSalesModified] = useState(false);
    const [isSignupModified, setIsSignupModified] = useState(false);
    const [isAchievementModified, setIsAchievementModified] = useState(false);

    async function fetchData() {
        setIsLoading(true);
        try {
            const config = await semcompApi.getConfig();

            setOpenSales(config.openSales);
            setSignup(config.openSignup);
            setOpenAchievement(config.openAchievement);
        } catch (error) {
            toast.error('Erro ao buscar dados do coffee');
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
            }
            const response = await semcompApi.updateConfig(config);
            toast.success('Salvo com sucesso!');
            setIsSalesModified(false);
            setIsSignupModified(false);
            setIsAchievementModified(false);
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
        <>
            <DataPage
                title="Configurações"
                isLoading={isLoading}
                table={
                    <div className='w-full flex flex-col items-center'>
                        <Accordion style={{ width: '50%' }}>
                            <AccordionTitle
                                title="Vendas e Inscrições"
                                modified={isSalesModified || isSignupModified}
                            />

                            <AccordionDetails>
                                <FormGroup>
                                    <FormControlLabel 
                                        control = {
                                            <Switch 
                                                checked={openSales}
                                                onChange={() => {
                                                    setOpenSales(!openSales);
                                                    setIsSalesModified(!isSalesModified);
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
                                                    setIsSignupModified(!isSignupModified);
                                                }}
                                            />
                                        }
                                        label="Inscrições abertas"
                                    />
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion style={{ width: '50%' }}>
                            <AccordionTitle
                                title="Conquistas"
                                modified={isAchievementModified}
                            />

                            <AccordionDetails>
                                <FormGroup>
                                    <FormControlLabel 
                                        control = {
                                            <Switch 
                                                checked={openAchievement}
                                                onChange={() => {
                                                    setOpenAchievement(!openAchievement);
                                                    setIsAchievementModified(!isAchievementModified);
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
            ></DataPage>
        </>
    );
}

export default RequireAuth(Config, "CONFIG");
