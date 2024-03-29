const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log("Server is running on Port " + port + " ...");
});

//Bidirectional socket  connection
const socketio = require("socket.io");

//Listen to the server through the constant created called server
const io = socketio(server);

//creating variables for the old game
var players = {},
  unmatched;

// on (listen) and emit (send) events
//listen for "connection" event with its "on" method
io.on("connection", (socket) => {
  console.log("New Player Id :", socket.id);
  joinGame(socket);

  socket.on("username", function (data) {
    socket.username = data;
    console.log("New Player Username :", socket.username);
  });

  socket.on("chat:message", (data) => {
    io.sockets.emit("chat:message", data);
    console.log(data);
  });

  socket.on("chat:typing", (data) => {
    socket.broadcast.emit("chat:typing", data);
  });

  if (getOpponent(socket)) {
    socket.emit("game.begin", {
      symbol: players[socket.id].symbol,
    });
    getOpponent(socket).emit("game.begin", {
      symbol: players[getOpponent(socket).id].symbol,
    });
  }

  socket.on("make.move", function (data) {
    if (!getOpponent(socket)) {
      return;
    }
    socket.emit("move.made", data);
    getOpponent(socket).emit("move.made", data);
  });

  socket.on("disconnect", function () {
    if (getOpponent(socket)) {
      getOpponent(socket).emit("opponent.left");
    }
  });
});

function joinGame(socket) {
  players[socket.id] = {
    opponent: unmatched,

    symbol: "X",
    socket: socket,
  };
  if (unmatched) {
    players[socket.id].symbol = "O";
    players[unmatched].opponent = socket.id;
    unmatched = null;
  } else {
    unmatched = socket.id;
  }
}

function getOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}
