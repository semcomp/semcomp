import { Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import DoneIcon from '@mui/icons-material/Done';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import Card from "../Card";
import { PaymentStatus } from "../../libs/constants/payment-status";
import { useEffect, useState } from "react";

interface PurchasesCardProps {
  user: any;
  config: any;
  closeSales: boolean;
  sales: any;
  onPurchaseClick: () => void;
  onPaymentClick: (payment: any) => void;
}
function usePixCountdown(createdAt: number){

  const [timeLeft, setTimeLeft] =  useState(0);

  useEffect(()=>{

      const durationHours = 2 * 60 * 60 * 1000;
      const start = createdAt;
      const end = start + durationHours;

      const interval = setInterval(() => {

        const now = Date.now();
        const diff = Math.max(0, Math.floor((end-now)/1000));
        setTimeLeft(diff);

        if(diff == 0) clearInterval(interval);
      }, 1000);
      
      return() => clearInterval(interval);
  });

  const hours = Math.floor(timeLeft/3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return {hours, minutes, seconds};

}

function PixCountdownTimer({ createdAt }: { createdAt: number }) {
  const { hours, minutes, seconds } = usePixCountdown(createdAt);

  return ( 
    <span className="ml-1 text-xs font-bold"> 
      {hours.toString().padStart(2, '0')}: 
      {minutes.toString().padStart(2, '0')}: 
      {seconds.toString().padStart(2, '0')} 
    </span> 
  );
}
function PurchasesCard({ user, config, closeSales, sales, onPurchaseClick, onPaymentClick }: PurchasesCardProps) {
  return (
    <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg justify-center">
      <h1 className="text-xl">
        Compras
      </h1>
      <div className="flex flex-wrap justify-center">
        {user && user.payments && (
          user.payments.map((payment: {
            sale: any[]; status: string, price: number, tShirtSize: string, createdAt: number, 
          }, index: number) => (
            (payment.status === PaymentStatus.APPROVED || payment.status === PaymentStatus.PENDING) && (
              <div key={`div-${index}`} className="mr-2 my-2">
                <Tooltip 
                  key={`tooltip-${index}`}
                  title={
                    payment.status === PaymentStatus.APPROVED 
                      ? "Pagamento confirmado!" 
                      : "Para acessar o QRCode, clique aqui"
                  }
                >
                  <Chip
                    sx={{
                      height: 'auto',
                      '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                      },
                    }}
                    key={`chip-${index}`}
                    label={`${payment.sale.map(sale => 
                      sale.hasTShirt ?  `${sale.name} - ${payment.tShirtSize}` : sale.name
                    ).join(", ")}`}
                    color={payment.status === PaymentStatus.APPROVED ? "success" : "warning"}
                    clickable={payment.status === PaymentStatus.APPROVED ? false : true}
                    onClick={() => {
                      if (payment.status === PaymentStatus.PENDING) {
                        onPaymentClick(payment);
                      }
                    }}
                    icon={payment.status === PaymentStatus.APPROVED ? 
                      <DoneIcon></DoneIcon>
                      :
                      <PixCountdownTimer createdAt={payment.createdAt} />
                    }
                  />
                </Tooltip>
              </div>
            )
          ))
        )}
      </div>
      { config && config.openSales ? (
        <>
          { !closeSales ? (
            <div className="flex flex-col items-center">
              {sales && (
                <>
                {sales.some(sale => sale.hasCoffee) && 
                 sales.some(sale => sale.hasKit) &&
                (
                  <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Coffee e o Kit da Semcomp com Pix!</p>
                )
                }

                {!sales.some(sale => sale.hasCoffee) && 
                 sales.some(sale => sale.hasKit) &&
                (
                  <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Kit da Semcomp com Pix!</p>
                )
                }

                {sales.some(sale => sale.hasCoffee) && 
                 !sales.some(sale => sale.hasKit) &&
                (
                  <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Coffee da Semcomp com Pix!</p>
                )
                }
                </>
              )}
              <button
                    onClick={onPurchaseClick}
                    className="bg-primary text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary mx-auto w-fit">
                    Comprar!
                  </button>
            </div>
            
          ) : 
            <>
              <p className="text-center"> As vendas estão esgotadas! </p>
            </>
          }
        </>
      ) : 
        <>
          <p className="text-center"> Não há vendas no momento. </p>
        </>
      }
    </Card>
  );
}

export default PurchasesCard; 