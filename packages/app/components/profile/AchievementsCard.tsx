import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Card from "../Card";

interface AchievementsCardProps {
  onViewAchievementsClick: () => void;
  onScanAchievementClick: () => void;
}

function AchievementsCard({ onViewAchievementsClick, onScanAchievementClick }: AchievementsCardProps) {
  return (
    <Card className="flex flex-col items-center p-9 w-full bg-[#222333] text-center rounded-lg justify-center">
      <div className="flex items-center justify-between w-full">
        <h1 className="flex-1 text-center" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Conquistas
        </h1>       
      </div>
      <div className="grid gap-4 grid-cols-2 phone:grid-cols-1">
        <button
          onClick={onViewAchievementsClick}
          className="bg-primary text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary"
        >
          Ver conquistas
        </button>
        <button
          onClick={onScanAchievementClick}
          className="bg-primary text-white p-3 rounded-lg mt-2 flex flex-row items-center justify-center hover:bg-white hover:text-primary"
        >
          <p className="mr-2">Escanear conquista</p>
          <CameraAltIcon 
            className=""
            cursor="pointer"
            titleAccess="Escanear Conquista"
          />
        </button>
      </div>
    </Card>
  );
}

export default AchievementsCard; 