import React from "react";
import Navbar from "../../../components/navbar";
import JoinTeam from "../../../components/game/join-team";
import { Card } from '@mui/material';
import Footer from '../../../components/Footer';

export default function (){

    return(
        <>
        <Navbar />
            <div className='p-6'>
                <Card className='p-6'>
                    <JoinTeam />
                </Card>
            </div>
            <Footer />

        </>
    );
}