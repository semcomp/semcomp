import TelegramIcon from "@mui/icons-material/Telegram";
import LogoFireWall from "../../assets/28-imgs/LogoFireWall.png";
import LogoMonteCarlo from "../../assets/28-imgs/LogoMonteCarlo.png";
import LogoS28 from "../../assets/28-imgs/LogoS28.png";
import LogoSemanal from "../../assets/28-imgs/LogoSemanal.png";
import Card from "../Card";

interface OverflowCardProps {
  user: any;
  onAboutOverflowClick: () => void;
}

function OverflowCard({ user, onAboutOverflowClick }: OverflowCardProps) {
  function getLogoUrl(logo: any): string | undefined {
    if (!logo) return undefined;
    return typeof logo === "string" ? logo : logo.src;
  }

  // TODO: Melhorar forma de recuperar as imagens da casa
  function getHouseLogoByName(name?: string) {
    if (!name) return null;
    const normalized = name.toLowerCase();
    if (normalized.includes("fire") || normalized.includes("firewall") || normalized.includes("fire wall")) {
      return LogoFireWall;
    }
    if (normalized.includes("monte") || normalized.includes("carlo")) {
      return LogoMonteCarlo;
    }
    if (normalized.includes("s28") || normalized.includes("s 28")) {
      return LogoS28;
    }
    if (normalized.includes("semanal") || normalized.includes("weekly")) {
      return LogoSemanal;
    }
    return null;
  }

  const houseName = user.house?.name as string | undefined;
  const houseLogo = getHouseLogoByName(houseName);
  const houseLogoUrl = getLogoUrl(houseLogo);
  return (
    <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg h-full justify-center">
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Overflow
      </h1>
      <strong>Sua casa é...</strong>
      <div className="flex flex-col items-center gap-3 mt-1">
        {houseLogoUrl && (
          <img src={houseLogoUrl} alt={houseName ?? "Casa"} className="rounded-[10px] w-8/12 object-contain" />
        )}
        <p className="house-name text-2xl">{houseName}</p>
      </div>
      {
        user.house?.telegramLink && 
        <a
          className="bg-primary text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary"
          href={user.house?.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar no grupo da casa 
          <TelegramIcon />
        </a> 
      }
      <a
        className="bg-primary text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary"
        href="https://t.me/semcomp_avisos"
        target="_blank"
        rel="noopener noreferrer"
      >
        Entrar no grupo de avisos
        <TelegramIcon />
      </a> 
      <button className="text-sm mt-5 text-white hover:underline" onClick={onAboutOverflowClick}>
        O que é o Overflow?
      </button>
    </Card>
  );
}

export default OverflowCard; 