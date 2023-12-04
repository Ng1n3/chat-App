const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const {addUser, removeUser, getUser, getusersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

/**
 * server(emit) -> client (receive) - countUpdated
 * client (emit) -> server (receive) - increment
 * server(emit) -> client(receive) - acknowledgment --> server
 * client(emit) -> server(receive) -> acknowledgment -> client
 */

    // socket.emit, speicif client
    // io.emit , every client
    // socket.broadcast.emit sent to everyone except the client
    // io.to.emit send to a specific room without sending to other rooms
    // socket.broad.to.emit send event to everyone except to a speicif client and limited to a specific chat room.

const PORT = 3050
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

// let count = 0;
let message = "welcome";

io.on("connection", (socket) => {
  console.log("New Websocket connection");

  socket.emit("message", generateMessage('Welcome')); // -> to emit to a particlar connection

  socket.broadcast.emit("message", generateMessage("A new user has joined")); // -> everybody but that connection

  socket.on('join', ({username, room}, callback) => {
    const {error, user} = addUser({ id: socket.id, username, room })
    if(error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getusersInRoom(user.room)
    })
    callback()
  })

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id)

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.username,message)); // -> send it to everyone
    callback("Delivered");
  });

  
  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
      callback();
    });

    socket.on("disconnect", () => {
      const user = removeUser(socket.id)
      if(user) {
        io.to(user.room).emit("message", generateMessage('Admin', `${user.username} has left`));
        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getusersInRoom(user.room)
        })
      }
    });
    
  // socket.emit('countUpdated', count)

  // socket.on('increment', () => {
  //   count++
  //   socket.emit('countUpdated', count) => Emits an event to a specific connection
  //   io.emit('countUpdated', count) // ==> Emits the event to all connections
  // })
});

server.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});

/**
 * WebSocket allow for full-duplex communication. i.e, client can send to server and vice versa
 * WebSocket is a serparte portocol from HTTP
 * Persistent connection between client and server
 */

