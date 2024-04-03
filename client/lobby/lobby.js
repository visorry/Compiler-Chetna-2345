document.addEventListener('DOMContentLoaded', function() {
    const socket = io("https://compiler-chetna-2345-production.up.railway.app/", { transports: ["websocket"] });
    const localPlayerNameInput = document.getElementById('localPlayerName');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const acceptBtn = document.getElementById('acceptBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const playerCountSpan = document.getElementById('playerCount');
    const emptySeatsSpan = document.getElementById('emptySeats');
    const playerList = document.getElementById('playerList');
    const notificationDiv = document.getElementById('notification');
    const senderNameSpan = document.getElementById('senderName');

    let localPlayerName = '';

    function updatePlayerCount(count) {
        playerCountSpan.textContent = count;
        emptySeatsSpan.textContent = 10 - count;
    }

    function addPlayer(playerName) {
        const playerItem = document.createElement('li');
        playerItem.classList.add('player-card');
        playerItem.dataset.playerName = playerName;
        playerItem.innerHTML = `
            <p class="player-name">${playerName}</p>
            <button class="send-request-button" data-target="${playerName}">Send Request</button>
        `;
        playerList.appendChild(playerItem);
    }

    function removePlayer(playerName) {
        const playerItem = playerList.querySelector(`li[data-player-name="${playerName}"]`);
        if (playerItem) {
            playerList.removeChild(playerItem);
        }
    }

    function joinRoom() {
        localPlayerName = localPlayerNameInput.value.trim();
        if (localPlayerName === '') {
            alert('Please enter a valid name');
            return;
        }
        localPlayerNameInput.setAttribute('readonly', true);
        socket.emit('new player', localPlayerName);
    }

    function sendRequest(targetPlayerName) {
        socket.emit('sendRequest', { sender: localPlayerName, receiver: targetPlayerName });
        console.log(`Sending request to ${targetPlayerName}`);
    }

    function showNotification(senderName) {
        senderNameSpan.textContent = senderName;
        notificationDiv.style.display = 'block';
    }

    joinRoomBtn.addEventListener('click', joinRoom);

    acceptBtn.addEventListener('click', function() {
        console.log(`Accept request from ${senderNameSpan.textContent}`);
        window.location.href = 'game.html';
        notificationDiv.style.display = 'none';
    });

    rejectBtn.addEventListener('click', function() {
        console.log(`Reject request from ${senderNameSpan.textContent}`);
        notificationDiv.style.display = 'none';
    });

    playerList.addEventListener('click', function(event) {
        if (event.target.matches('.send-request-button')) {
            const targetPlayerName = event.target.getAttribute('data-target');
            sendRequest(targetPlayerName);
        }
    });

    socket.on('receiveRequest', ({ sender }) => {
        const accept = confirm(`Incoming request from ${sender}. Do you want to accept?`);
        if (accept) {
            showNotification(sender);
        } else {
            rejectRequest();
        }
    });

    socket.on('current players', players => {
        playerList.innerHTML = '';
        players.forEach(player => {
            addPlayer(player);
        });
        updatePlayerCount(players.length);
    });

    socket.on('player joined', playerName => {
        addPlayer(playerName);
        updatePlayerCount(playerList.querySelectorAll('.player-card').length);
    });

    socket.on('player left', playerName => {
        removePlayer(playerName);
        updatePlayerCount(playerList.querySelectorAll('.player-card').length);
    });

    socket.emit('get players');
});