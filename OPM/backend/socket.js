const socketIo = require("socket.io");
let io;
let sockets = [];

function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: "*",
      credentials: true,
    },
  });
  io.on("connection", (socket) => {

    socket.on("register-user", (userId) => {
      sockets.push({ user: userId, socket: socket.id })
      // console.log(sockets)
    });

    socket.on("disconnect", () => {
      // console.log("A user disconnected: ", socket.id);
      sockets = sockets.filter(s => s.socket !== socket.id);
      // console.log(sockets)
    });
  });
}

function notifyUser(users, object, eventTitle) {
  try {
    const filtredSockets = sockets.filter(socket => users.includes(socket.user));
    if (filtredSockets.length !== 0) {
      // Emit an event to all filtered sockets
      for (let i = 0; i < filtredSockets.length; i++) {
        io.to(filtredSockets[i].socket).emit(eventTitle, object);
        // console.log('Event emitted to:', filtredSockets[i].socket);
      }
    }
  } catch (error) {
    console.error('Error in notifyUser:', error);
  }
}


module.exports = { initSocket, notifyUser };
