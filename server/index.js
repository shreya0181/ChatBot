const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const app = express();
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");
// specify Port
const PORT = process.env.PORT || 5000;

// --- basic rundown to make socket.io working
// use socket.io for realtime usage, it is faster

// created a server using  hhtp.create server
const server = http.createServer(app);
// io is an instance of socket io
const io = socketio(server);
const router = require("./router");

//  using socket.io to connect and disconnect client ----> using on
// socket is just a user
io.on("connection", (socket) => {
  // using the----- same event as in emmit--- to handle emmit has a callback function
  socket.on("join", ({ name, room }, callback) => {
    //   so we get the access on the backend of name and room
    // console.log(name + " " + room);
    const { error, user } = addUser({ id: socket.id, name, room });
    // console.log("sockketid" + socket.id);
    if (error) return callback(error);
    // join user to the room
    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    //  broadcasts the message to everyone besides the user and only in the specified room
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    console.log(getUser(socket.id));
    const user = getUser(socket.id);
    //  sending the message
    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  // managing the socket
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// using router as an intermeditator
app.use(router);

// make server running
server.listen(PORT, () => console.log(`server has started on ${PORT}`));
