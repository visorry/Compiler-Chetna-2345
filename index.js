const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const authRoutes = require('./loginRoute');
const mongoose = require('mongoose');

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
app.use(cors(), express.json());
mongoose.connect('mongodb+srv://vis:vishnu@cluster0.wcrafar.mongodb.net/tictacgoo?retryWrites=true&w=majority').then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Mount the auth routes
app.use('/auth', authRoutes);

// Game namespace
const gameNamespace = io.of('/game');
// Lobby namespace
const lobbyNamespace = io.of('/lobby');

let lobbyPlayers = [];
let lobbies = []; // Store lobby names

// Handle socket connections for game
gameNamespace.on("connection", (socket) => {
  console.log("New Game Player Id:", socket.id);
  joinGame(socket);

  socket.on("username", (data) => {
    socket.username = data;
    console.log("New Game Player Username:", socket.username);
  });

  socket.on("chat:message", (data) => {
    gameNamespace.emit("chat:message", data); // Broadcast the message to all connected clients in game namespace
    console.log(data);
  });

  socket.on("chat:typing", (data) => {
    socket.broadcast.emit("chat:typing", data); // Broadcast the typing event to all clients except the sender in game namespace
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

// Handle socket connections for lobby
lobbyNamespace.on('connection', socket => {
    console.log('New Lobby Player connected');

    // Create lobby
    socket.on('createLobby', ({ lobbyName }) => {
        if (!lobbyPlayers.some(player => player.id === socket.id)) { // Check if the player is already in the lobbyPlayers list
            lobbyPlayers.push({ id: socket.id, lobbyName: lobbyName }); // Add lobby name to the player's data
            updateLobby();
        }
    });

    // Join lobby
    socket.on('joinLobby', ({ lobbyName }) => {
        if (lobbies.includes(lobbyName)) {
            socket.join(lobbyName);
            lobbyNamespace.to(socket.id).emit('joinLobbySuccess', lobbyName); // Notify client of successful join
        }
    });

    // List lobbies
    socket.on('listLobbies', () => {
        const otherLobbies = lobbyPlayers.filter(player => player.id !== socket.id).map(player => player.lobbyName);
        lobbyNamespace.to(socket.id).emit('lobbyListUpdate', otherLobbies);
    });

    // Send the current lobby players to the newly connected player
    socket.emit('currentPlayers', lobbyPlayers.map(player => player.name));

    // Add the newly connected player to the lobbyPlayers array
    socket.on('newPlayer', playerName => {
        lobbyPlayers.push({ name: playerName, id: socket.id });
        console.log(lobbyPlayers);
        lobbyNamespace.emit('playerJoined', playerName); // Inform all connected clients about the new player
    });

    // Handle game requests
    socket.on('sendRequest', ({ sender, receiver }) => {
        const receiverPlayer = lobbyPlayers.find(player => player.name === receiver);
        if (receiverPlayer) {
            lobbyNamespace.to(receiverPlayer.id).emit('receiveRequest', { sender });
        }
    });

    // Handle disconnection of players
    socket.on('disconnect', () => {
        console.log('A Lobby user disconnected');
        const index = lobbyPlayers.findIndex(player => player.id === socket.id);
        if (index !== -1) {
            const playerName = lobbyPlayers[index].name;
            lobbyPlayers.splice(index, 1);
            lobbyNamespace.emit('playerLeft', playerName); // Inform all connected clients about the disconnected player
        }
    });
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

function updateLobby() {
  const otherLobbies = lobbyPlayers.map(player => player.lobbyName);
  lobbyNamespace.emit('lobbyListUpdate', otherLobbies);
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
