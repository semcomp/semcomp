import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Modal from "../Modal";
import SemcompApi from '../../api/semcomp-api';
import { SemcompApiAchievement, SemcompApiHouse, SemcompApiUser } from '../../models/SemcompApiModels';
import { Autocomplete, Button, TextField } from '@mui/material';
import AchievementTypes from '../../libs/constants/achievement-types-enum';
import { useAppContext } from '../../libs/contextLib';
import { PaginationRequest } from '../../models/Pagination';
import Spinner from '../reusable/Spinner';
import LoadingButton from '../reusable/LoadingButton';

function SetAchievement ({
    achievement,
    onRequestClose,
} : {
    achievement: SemcompApiAchievement,
    onRequestClose: () => void,
}) {
    const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
    const [assignedUsers, setAssignedUsers] = useState<SemcompApiUser[]>([]);
    const [assignedHouses, setAssignedHouses] = useState<SemcompApiHouse[]>([]);
    const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData(), 1, 9999));
    const [users, setUsers] = useState([]); 
    const [houses, setHouses] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [isIndividual, setIsIndividual] = useState(false);

    async function fetchData() {
        setIsLoading(true);

        try {
            const responseUsers = await semcompApi.getUsers(pagination);
            setUsers(responseUsers.getEntities());

            const responseHouses = await semcompApi.getHouses(pagination);
            setHouses(responseHouses.getEntities());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        fetchData();
        setIsIndividual(achievement.type === AchievementTypes.INDIVIDUAL);
    }
    , []);

    async function handleSubmit() {
        if (isIndividual) {
            if (assignedUsers.length === 0) {
                onRequestClose();
                return;
            }

            try {
                setIsLoading(true);

                assignedUsers.forEach(async (user) => {
                    await semcompApi.addUserAchievement(user.id, achievement.id);
                    toast.success(`Conquista atribuída para ${user.name}`);
                });

                onRequestClose();
            } catch (error) {
                toast.error('Erro ao atribuir conquista', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            if (assignedHouses.length === 0) {
                onRequestClose();
                return;
            }

            try {
                setIsLoading(true);

                assignedHouses.forEach(async (house) => {
                    await semcompApi.addHouseAchievement(house.id, achievement.id);
                    toast.success(`Conquista atribuída para ${house.name}`);
                });

                onRequestClose();
            } catch (error) {
                toast.error('Erro ao atribuir conquista', error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <Modal onRequestClose={onRequestClose}>
            <div
                className="w-full bg-black text-white text-center text-xl font-bold p-6"
            >
                Atribuir Conquista
            </div>
            { isLoading ?
                <div className='my-5'>
                    <Spinner /> 
                </div>
            : (
            <>   
                <div className="max-h-96 overflow-y-scroll p-6 w-full">
                    <div className="flex flex-col gap-4">
                        { 
                            isIndividual ? (
                                <Autocomplete
                                    multiple
                                    options={users}
                                    getOptionLabel={(user) => user.name}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Usuários"
                                            placeholder="Selecione os usuários"
                                        />
                                    )}
                                    value={assignedUsers}
                                    onChange={(_, newValue) => setAssignedUsers(newValue)}
                                /> 
                            ) : (
                                <Autocomplete
                                    multiple
                                    options={houses}
                                    getOptionLabel={(house) => house.name}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            label="Casas"
                                            placeholder="Selecione as casas"
                                        />
                                    )}
                                    value={assignedHouses}
                                    onChange={(_, newValue) => setAssignedHouses(newValue)}
                                />
                            )
                        }
                    </div>
                </div>
            </>
            )}
            <div className="w-full px-6">
                <LoadingButton
                isLoading={isLoading}
                className="w-full text-white py-3 px-6"
                onClick={handleSubmit}
                >
                Enviar
                </LoadingButton>
                <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
                Fechar
                </button>
            </div>
        </Modal>
    );
};

export default SetAchievement;