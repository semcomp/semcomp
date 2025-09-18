import { Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import DoneIcon from '@mui/icons-material/Done';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import Card from "../Card";
import { PaymentStatus } from "../../libs/constants/payment-status";

interface PurchasesCardProps {
  user: any;
  config: any;
  closeSales: boolean;
  onPurchaseClick: () => void;
  onPaymentClick: (payment: any) => void;
}

function PurchasesCard({ user, config, closeSales, onPurchaseClick, onPaymentClick }: PurchasesCardProps) {
  return (
    <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg justify-center">
      <h1 className="text-xl">
        Compras
      </h1>
      <div className="flex flex-wrap justify-center">
        {user && user.payments && (
          user.payments.map((payment: {
            sale: any[]; status: string, price: number, tShirtSize: string 
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
                      <HourglassTopIcon></HourglassTopIcon>
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
            <>
              <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Coffee e o Kit da Semcomp com Pix!</p>
              <button
                onClick={onPurchaseClick}
                className="bg-primary text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary">
                Comprar!
              </button>
            </>
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