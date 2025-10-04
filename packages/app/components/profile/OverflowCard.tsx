import TelegramIcon from "@mui/icons-material/Telegram";
import Card from "../Card";

interface OverflowCardProps {
  user: any;
  onAboutOverflowClick: () => void;
}

function OverflowCard({ user, onAboutOverflowClick }: OverflowCardProps) {
  return (
    <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg h-full justify-center">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Overflow
      </h1>
      <strong>Sua casa é...</strong>
      <p className="house-name text-2xl">{user.house?.name}</p>
      <a
        className="bg-primary text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary"
        href={user.house?.telegramLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Entrar no grupo da casa 
        <TelegramIcon />
      </a> 
      <a
        className="bg-primary text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary"
        href="https://t.me/+XszTILsnIoAyYjEx"
        target="_blank"
        rel="noopener noreferrer"
      >
        Entrar no grupo do Overflow 
        <TelegramIcon />
      </a> 
      <button className="text-sm mt-5 text-white hover:underline" onClick={onAboutOverflowClick}>
        O que é o Overflow?
      </button>
    </Card>
  );
}

export default OverflowCard; 