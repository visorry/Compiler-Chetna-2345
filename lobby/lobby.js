const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Array to store connected players
let players = [];

io.on('connection', socket => {
    console.log('A user connected');

    socket.emit('current players', players);

    socket.on('new player', playerName => {
        players.push(playerName);
        console.log(players);
        io.emit('player joined', playerName);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const index = players.indexOf(socket.playerName);
        if (index !== -1) {
            const playerName = players.splice(index, 1)[0];
            io.emit('player left', playerName);
        }
    });
});

// Serve the lobby.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'lobby.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
