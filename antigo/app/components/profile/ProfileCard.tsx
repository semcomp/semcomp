import { QRCodeSVG } from "qrcode.react";
import { Tooltip } from "@mui/material";
import Card from "../Card";

interface ProfileCardProps {
  user: any;
  onEditClick: () => void;
}

function ProfileCard({ user, onEditClick }: ProfileCardProps) {
  return (
    <Card className="flex flex-col items-center p-9 w-full bg-cardDarkBackground rounded-lg justify-center">
      <div className="ml-2">
        <Tooltip
          arrow
          placement="top-start"
          title={user.wantNameTag != null ? user.wantNameTag ? "Você optou por receber o crachá físico!" : "Você optou por não receber o crachá físico" : ""}
          enterTouchDelay={1}
        >
          <div className="border-8 border-solid rounded-lg border-white">
            <QRCodeSVG value={user && user.id} />
          </div>
        </Tooltip>
      </div>
      <p className="flex flex-row text-xl text-center my-3">
        {user.name} 
      </p>
      <p className="text-center">{user.course}</p>
      <div className="flex flex-col pt-3">
        <button
          onClick={onEditClick}
          className="bg-primary text-white hover:bg-white hover:text-primary p-2 rounded-lg"
        >
          Editar
        </button>
      </div>
    </Card>
  );
}

export default ProfileCard; 