import React from "react";
import { useTeam, useSocket } from "..";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import Spinner from "../../../components/spinner";
import { EVENTS_PREFIX } from "../../../constants/riddlethon";

import "./style.css";

function Message({ message }) {
  const me = useSelector((state) => state.auth.user);

  const AmITheSender = me.id === message.user.id;
  const sentDate = new Date(message.createdAt);

  return (
    <div
      className={"my-2 p-2 pb-0 rounded-lg"}
      style={{
        width: "80%",
        alignSelf: AmITheSender ? "flex-end" : "flex-start",
        backgroundColor: AmITheSender ? "#BDE0F3" : "#F0F0E8",
      }}
    >
      {!AmITheSender && (
        <div className="font-bold text-sm">{message.user.name}</div>
      )}
      <div>{message.text}</div>
      <div style={{ fontSize: 10, textAlign: "right" }}>
        {sentDate.getHours().toString().padStart(2, "0")}:
        {sentDate.getMinutes().toString().padStart(2, "0")}
      </div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = React.useState([]);
  const messageRef = React.useRef();
  const { team, isFetchingTeam } = useTeam();
  const socket = useSocket();

  async function sendMessage(event) {
    event.preventDefault();

    const message = messageRef.current.value.trim();
    if (!message) return;
    messageRef.current.value = "";

    socket.send(`${EVENTS_PREFIX}chat-message`, message);
  }

  React.useEffect(() => {
    socket.on(`${EVENTS_PREFIX}chat-message`, (newMessage) => {
      setMessages((state) => [...state, newMessage]);
    });
  }, []);

  function renderChat() {
    if (isFetchingTeam) return <Spinner size="large" className="pt-4" />;

    if (!team) return <div>Você ainda não está numa equipe</div>;

    return (
      <>
        <div className="w-full pb-2 text-center border-b">{team.name}</div>
        <div className="h-full w-full flex flex-col overflow-y-scroll px-2">
          {messages.map((message, index) => (
            <Message message={message} key={index} />
          ))}
        </div>
        <form onSubmit={sendMessage} className="w-full px-2">
          <TextField inputRef={messageRef} fullWidth label="Mensagem" />
        </form>
      </>
    );
  }

  return (
    <div
      className="riddlethon-chat-component"
      style={{ maxWidth: 400, height: 400 }}
    >
      {renderChat()}
    </div>
  );
}

export default Chat;
