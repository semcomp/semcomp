import React from 'react';
import Navbar from '../navbar';
import Sidebar from '../sidebar';
import SimpleBackground from '../home/SimpleBackground';
import NewFooter from '../../pages/newFooter';
import Spinner from '../spinner';

interface GameAccessLoaderProps {
  isCheckingAccess: boolean;
  isGameOpen: boolean;
}

export default function GameAccessLoader({ isCheckingAccess, isGameOpen }: GameAccessLoaderProps) {
  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <SimpleBackground />
      <main className="flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10">
        <div className='flex flex-col items-center justify-center md:w-[50%] mobile:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg'>      
          <div className='items-center justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20 text-white'>
            <div className='z-20 h-full w-full flex flex-col items-center justify-center'>
              <div className='flex flex-col items-center justify-center text-xl font-secondary py-16'>
                <p className='pb-4'>
                  {isCheckingAccess ? 'Verificando acesso...' : 'Redirecionando para o perfil...'}
                </p>
                <Spinner size="large"/>
              </div>
            </div>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 