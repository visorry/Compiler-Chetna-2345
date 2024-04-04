// Client side (lobby.js)
const lobbySocket = io('https://compiler-chetna-2345-production.up.railway.app/lobby');

function createLobby() {
    const lobbyName = prompt("Enter lobby name:");
    if (lobbyName.trim() !== "") { // Check if lobby name is not empty
        lobbySocket.emit("createLobby", { lobbyName });
        // Request lobby list update immediately after creating a lobby
        lobbySocket.emit("listLobbies");
        window.location.href = `../game/game.html`;
    } else {
        alert("Please enter a valid lobby name.");
    }
}

lobbySocket.on("lobbyListUpdate", (lobbyList) => {
    const lobbyListItems = document.getElementById("lobbyListItems");
    lobbyListItems.innerHTML = ""; // Clear existing lobby list
    lobbyList.forEach((lobby) => {
        const lobbyItem = document.createElement("div");
        lobbyItem.classList.add("lobby-card");
        const lobbyName = document.createElement("h5");
        lobbyName.textContent = lobby;
        lobbyItem.appendChild(lobbyName);
        const joinButton = document.createElement("button");
        joinButton.textContent = "Join";
        joinButton.classList.add("button");
        joinButton.addEventListener("click", () => {
            joinLobby(lobby);
        });
        lobbyItem.appendChild(joinButton);
        lobbyListItems.appendChild(lobbyItem);
    });
    document.getElementById("lobbyList").style.display = "block"; // Show lobby list
});

function joinLobby(lobbyName) {
    lobbySocket.emit("joinLobby", { lobbyName });
    // Redirect to game.html upon joining a lobby
    window.location.href = `../game/game.html`;
}

// Request lobby list update initially when the page loads
lobbySocket.emit("listLobbies");
