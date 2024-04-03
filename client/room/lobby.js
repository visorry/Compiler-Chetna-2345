const socket = io('http://localhost:5000/');

// Client side (lobby.js)
function createLobby() {
    const lobbyName = prompt("Enter lobby name:");
    socket.emit("createLobby", { lobbyName });
    // Request lobby list update immediately after creating a lobby
    socket.emit("listLobbies");
    window.location.href = `../game/game.html`;
}

socket.on("lobbyListUpdate", (lobbyList) => {
    const lobbyListItems = document.getElementById("lobbyListItems");
    lobbyListItems.innerHTML = ""; // Clear existing lobby list
    lobbyList.forEach((lobby) => {
        const lobbyItem = document.createElement("div");
        lobbyItem.textContent = lobby;
        const joinButton = document.createElement("button");
        joinButton.textContent = "Join";
        joinButton.addEventListener("click", () => {
            joinLobby(lobby);
        });
        lobbyItem.appendChild(joinButton);
        lobbyListItems.appendChild(lobbyItem);
    });
    document.getElementById("lobbyList").style.display = "block"; // Show lobby list
});

function joinLobby(lobbyName) {
    socket.emit("joinLobby", { lobbyName });
    // Redirect to game.html upon joining a lobby
    window.location.href = `../game/game.html`;
}

// Request lobby list update initially when the page loads
socket.emit("listLobbies");
