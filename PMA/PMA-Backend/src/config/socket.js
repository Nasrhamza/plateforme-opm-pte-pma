const { Server } = require("socket.io");

const PMA_ACTIVE_USER = 'PMA_ACTIVE_USER';
const PMA_EVENT = 'PMA_EVENT';

let connectedUsers = [];
let io;


function connectSocket(server){
    console.log("connecting socket...")
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        socket.on(PMA_ACTIVE_USER, (userId) => {
            connectedUsers.push({ userId, socket : socket.id });
        });

        socket.on("disconnect", () => {
            connectedUsers = connectedUsers.filter(item => item.socket !== socket.id);
        });
    });
};


async function sendNotification(notification){
    try {
        const sockets = connectedUsers.filter(object => object.userId === notification.recepient.toString());
        sockets.forEach((user, index) => {
            //add delay to handle race condition when sending the events(sinon it will emit event only in 1 socket)
            setTimeout(() => {
                io.to(user.socket).emit(PMA_EVENT, notification);
            }, index * 1000);
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    connectSocket,
    sendNotification
}