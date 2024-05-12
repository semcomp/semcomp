
import Footer from "../../components/Footer";
import Navbar from "../../components/navbar"; 
import Sidebar from '../../components/sidebar';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import API from "../../api";
import Status from "../../libs/constants/status-treasure-hunt-enum";

const TreasureHuntPage = () => {
    const router = useRouter();

    const [imageFetched, setImageFetched] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    
    async function fetchTreasureHuntData() {
        console.log(router.query?.id);
        const { data } = await API.treasureHunt.getImage(router.query?.id);
        console.log(data);
    
        setImageFetched(data);
    }
    
    // useEffect(() => {
    //     console.log(window.location.pathname);
    //     if (window.location.pathname != router.pathname) {
    //       // router.query.lang is defined
    //     }
    //   }, [router])
    
    useEffect(() => {
        if(router.query.id){
            fetchTreasureHuntData();
        }
    }, [router.query]);

    useEffect(() => {
        if(imageFetched){
            if(imageFetched.status === Status.BLOCKED){
                setIsBlocked(true);
            }else if(imageFetched.status === Status.TIMESUP){
                setHasEnded(true);
            }
        }
    }, [imageFetched]);
    
    return (
        <div className="min-h-full w-full flex flex-col">
        <Navbar />
        <Sidebar />

        {/* This div is here to allow for the aside to be on the right side of the page */}
        <div className=" m-8 flex flex-col items-center md:w-full md:justify-between md:px-16 md:py-8 md:m-0">
            <main className=" flex flex-col align-center g:w-full">
                
            {imageFetched && !isBlocked && !hasEnded && (
                <img
                    src={imageFetched.imgUrl}
                    alt=""
                    className="max-w-full w-[500px] h-full object-contain py-4"
                />
            )}

            {
                isBlocked &&
                <h1>
                    A Caça ao Tesouro ainda não foi liberada. Por favor, retorne ao evento 'Gamenight' e aguarde as instruções.
                </h1>
            }
            {
                hasEnded &&
                <h1>
                    Temos um vencedor! Por favor, retorne ao evento 'Gamenight', pois a Caça ao Tesouro foi encerrada.
                </h1>
            }
            </main>
        </div>
        <Footer />
        </div>
    );
};

export default TreasureHuntPage;
