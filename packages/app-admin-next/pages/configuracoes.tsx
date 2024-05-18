import { useEffect, useRef, useState } from 'react';
import {toast} from 'react-toastify';

import DataPage from "../components/DataPage";
import Input, { InputType } from "../components/Input";
import LoadingButton from '../components/reusable/LoadingButton';
import { useAppContext } from '../libs/contextLib';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import SwitchButton from '../components/SwitchButton';

export enum KitOption {
    COMPLETE = "COMPLETE", 
    KIT = "KIT",
    COFFEE = "COFFEE",
}
  
const kitOption = Object.values(KitOption);
  
/** Tailwind styles. */
const style = {
  main: 'h-full flex justify-center items-center p-4',
  card: 'rounded-lg p-4 bg-white shadow-lg w-full max-w-md flex flex-col items-center mx-2',
  title: 'text-2xl font-bold',
  form: 'w-full flex flex-col justify-center items-center',
  input: 'my-2 py-2 px-4 border rounded-lg w-full',
  button: 'bg-gray-600 text-white px-4 py-2 mt-2 mb-4 rounded-lg w-full',
  hr: 'w-full border-b',
  createAccountLink: 'text-sm mt-2',
  link: 'text-blue-500',
  switchInput: 'opacity-0 w-0 h-0',
};

function Config() {
    const [isLoading, setIsLoading] = useState(false);
    const {
        setUser, semcompApi
    }: {
        setUser: any, semcompApi: SemcompApi
    } = useAppContext();
    
    const [openSales, setOpenSales] = useState(false);
    const [coffeeTotal, setCoffeeTotal] = useState(0);
    const [saveKitOption, setSaveKitOption] = useState("COFFEE");

    const [openSignup, setSignup] = useState(false);
           
    const [switchBeta, setSwitchBeta] = useState(false);
           
    async function fetchData() {
        setIsLoading(true);
        try {
            const config = await semcompApi.getConfig();

            setSaveKitOption(config.kitOption);
            setCoffeeTotal(config.coffeeTotal);
            setOpenSales(config.openSales);
            setSignup(config.openSignup);
            setSwitchBeta(config.switchBeta);
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
        if (coffeeTotal <= 0) return toast.error('Você deve fornecer um tamanho');
        if (!KitOption[saveKitOption]) return toast.error('Você deve fornecer uma opção de kit válida');
        
        try {
        setIsLoading(true);
        const config = {
            coffeeTotal: coffeeTotal,
            kitOption: saveKitOption,
            openSales: openSales,
        }
        const response = await semcompApi.updateConfig(config);
        toast.success('Salvo com sucesso!');
        } catch (error) {
        console.error(error);
        toast.error('Erro no servidor!');
        } finally {
        setIsLoading(false);
        }
    }

    // Função para alternar o status do coffee
    const toggleSales = async () => {
        const confirmed = window.confirm("Tem certeza de que deseja alterar o status do Coffee?");
        if (confirmed) {
            setOpenSales(!openSales);
        }
    };

    function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setCoffeeTotal(Number(value));
    }
    
    function handleKitOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSaveKitOption(value);
    }

    //Função para alterar o openSignup do bando de dados usando a SemcompAPI
    const setConfigSignup = async (setSignup) => {
        try {
            const response = await semcompApi.setConfigSignup(setSignup);
        } catch (error) {
            console.error('Erro ao alterar openSignup no banco de dados(configuracoes.tsx):', error);
        }
    };

    //Função para alterar o status de semcomp Beta ou Alfa no bando de dados usando a SemcompAPI
    const setConfigSwitchBeta = async (setSwitchBeta) => {
        try {
            const response = await semcompApi.setConfigBeta(setSwitchBeta);
        } catch (error) {
            console.error('Erro ao alterar o status do switch Beta no banco de dados(configuracoes.tsx):', error);
        }
    };

    return (
        <>
            <DataPage
                title="Configurações"
                isLoading={isLoading}
                table={
                    <div className={style.main}>
                        <div className={style.card}>
                            <div className={style.title}>Coffee</div>
                            <hr className={style.hr} />
                            <div>   
                            <Input
                                className="my-3"
                                label="Quantidade"
                                value={coffeeTotal}
                                onChange={handleQuantityChange}
                                type={InputType.Number}
                            />
                            <button className={style.button} onClick={toggleSales}>
                                {openSales ? 'Desativar' : 'Ativar'} coffee
                            </button>
                            </div>
                        </div>

                        <div className={style.card}>
                            <div className={style.title}>Opções de venda</div>
                            <hr className={style.hr} />
                            <div>   
                                <Input
                                    className="my-3"
                                    label="Opções:"
                                    value={KitOption[saveKitOption]}
                                    onChange={handleKitOptionChange}
                                    choices={kitOption}
                                    type={InputType.Select}
                                />
                            </div>
                        </div>

                        <div className="w-full px-6">
                            <LoadingButton
                            isLoading={isLoading}
                            className="w-full text-white py-3 px-6"
                            onClick={handleSubmit}
                            >
                            Enviar
                            </LoadingButton>
                        </div>

                        <div className={style.card}>
                            <div className={style.title}>Abrir Inscrições</div>
                            <hr className={style.hr} />
                            <div className='p-2'>   
                                <SwitchButton 
                                    isChecked={openSignup} 
                                    setIsChecked={setSignup} 
                                    setIsCheckedDataBase={setConfigSignup}
                                />
                            </div>
                        </div>
                    
                        <div className={style.card}>
                            <div className={style.title}>Trocar modo Beta</div>
                            <hr className={style.hr} />
                            <div className='p-2'>   
                                <SwitchButton 
                                    isChecked={switchBeta} 
                                    setIsChecked={setSwitchBeta} 
                                    setIsCheckedDataBase={setConfigSwitchBeta}
                                />
                            </div>
                        </div>
                    
                    </div>
                }
            ></DataPage>
        </>
    );
}

export default RequireAuth(Config, "CONFIG");
