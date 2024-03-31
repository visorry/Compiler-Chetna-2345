const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

// Use CORS middleware to allow requests from any origin
app.use(cors());

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New Player Id:", socket.id);
  joinGame(socket);

  socket.on("username", (data) => {
    socket.username = data;
    console.log("New Player Username:", socket.username);
  });

  socket.on("chat:message", (data) => {
    io.emit("chat:message", data); // Broadcast the message to all connected clients
    console.log(data);
  });

  socket.on("chat:typing", (data) => {
    socket.broadcast.emit("chat:typing", data); // Broadcast the typing event to all clients except the sender
  });

  const opponent = getOpponent(socket);
  if (opponent) {
    // Begin the game for both players
    socket.emit("game.begin", { symbol: players[socket.id].symbol });
    opponent.emit("game.begin", { symbol: players[opponent.id].symbol });
  }

  socket.on("make.move", (data) => {
    const opponent = getOpponent(socket);
    if (opponent) {
      // Send the move to both players
      socket.emit("move.made", data);
      opponent.emit("move.made", data);
    }
  });

  socket.on("disconnect", () => {
    const opponent = getOpponent(socket);
    if (opponent) {
      opponent.emit("opponent.left");
    }
  });
});

let Lobbyplayers = [];

io.on('connection', socket => {
    console.log('A user connected');

    socket.emit('current players', Lobbyplayers.map(player => player.name)); // new 

    socket.on('new player', playerName => {
      Lobbyplayers.push({ name: playerName, id: socket.id });
      console.log(Lobbyplayers);
      io.emit('player joined', playerName); // new 
  });

    socket.on('sendRequest', ({ sender, receiver }) => {
      const receiverPlayer = Lobbyplayers.find(player => player.name === receiver);
      if (receiverPlayer) {
          io.to(receiverPlayer.id).emit('receiveRequest', { sender });
      }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    const index = Lobbyplayers.findIndex(player => player.id === socket.id);
    if (index !== -1) {
        const playerName = Lobbyplayers[index].name;
        Lobbyplayers.splice(index, 1);
        io.emit('player left', playerName);
    }
});  // new 
 });


// Initialize player data
const players = {};
let unmatched;

function joinGame(socket) {
  players[socket.id] = {
    opponent: unmatched,
    symbol: "X", // Default symbol for the player
    socket: socket,
  };
  if (unmatched) {
    // If there's an unmatched player, assign symbols and set opponents
    players[socket.id].symbol = "O";
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    // If no unmatched player, set the current player as unmatched
    unmatched = socket.id;
  }
}

function getOpponent(socket) {
  // Get the opponent of a given player
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}

// Start the server
server.listen(port, () => {
  console.log("Server is running on Port " + port + " ...");
});
