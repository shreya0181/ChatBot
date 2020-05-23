import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";

import "./chat.css";
let socket;
const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  // reference to every single message
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  // useState to update the message array to keep track of messages
  const [messages, setMessages] = useState([]);

  const ENDPOINT = "localhost:5000";
  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    //create socket using socket variable  socket  passing an endpoint to the
    socket = io(ENDPOINT);
    setName(name);
    setRoom(room);
    // console.log(socket);
    // event is emitted and we interract with the payload from backend
    socket.emit("join", { name, room }, () => {});
    return () => {
      // happens on unmounting of object
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, []);

  // function to send message
  const sendMessage = (event) => {
    // so that the keypress event handler does not refereh the page when called
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => {
        // set message null for cleaning
        setMessage("");
      });
    }
  };

  console.log(message, messages);
  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
        {/* <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyPress={(event) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        /> */}
      </div>
      <TextContainer users={users} />
    </div>
  );
};
export default Chat;
