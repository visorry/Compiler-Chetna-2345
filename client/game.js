const socket = io();

let message = document.getElementById("message");
let send_btn = document.getElementById("send");
let output = document.getElementById("output");
let actions = document.getElementById("actions");
let typo = document.getElementById("typo");

var timeout;

function timeoutFunction() {
  socket.emit("chat:typing", false);
}

function getParsedTime() {
  const date = new Date();
  let hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  let min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  return hour + ":" + min;
}

let username = prompt("Please enter your username", "");
if (!username) {
  username = "Anonymous";
}

//Let the socket at the server "know" the value of the username.
socket.emit("username", username);

// getting previous saved highscore
var tic_tac_toe_highscore = window.localStorage.getItem(
  "tic_tac_toe_highscore"
);

// if player plays for first time then create highscore
if (tic_tac_toe_highscore == undefined) {
  window.localStorage.setItem("tic_tac_toe_highscore", 0);
}

send_btn.addEventListener("click", function (event) {
  event.preventDefault();

  socket.emit("chat:message", {
    username: username,
    message: message.value,
  });

  document.getElementById("form").reset();

  const element = document.getElementById("chat-container");
  element.scrollTop = element.scrollHeight + 100;
});

console.log({
  username: username,
  message: message.value,
});

//output the username when the user is typing
message.addEventListener("keypress", function () {
  socket.emit("chat:typing", username);
  clearTimeout(timeout);
  timeout = setTimeout(timeoutFunction, 1000);
});

//shows in div output the user with their message in all windows
socket.on("chat:message", function (data) {
  actions.innerHTML = ``;

  let bkg = username === data.username ? "white" : "#353839";
  let txtcolor = username === data.username ? "black" : "white";
  let position = username === data.username ? "right" : "left";

  output.innerHTML +=
    ` <p class="padd ${position} msg_border " style="background: ` +
    bkg +
    `; color: ${txtcolor}; margin-right: 7px;
  margin-left: 7px;padding-top: 5px;max-width: 70%; padding-bottom: 5px;padding-left: 5px;padding-right: 5px;margin-bottom: 5px;"` +
    ` ><span style="font-size: xx-small;">${getParsedTime()}</span>
    <strong style="font-size: small;" class="pad">${data.username}</strong> : ${
      data.message
    }
    </p> `;
});

socket.on("chat:typing", function (data) {
  if (data) {
    typo.innerHTML = "<p><em>" + data + " is typing ...</em></p>";
  } else {
    typo.innerHTML = "";
  }
});

//Variable for the (X or O symbol)
var symbol;

$(function () {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
  // Event is called when when either player makes a move
  socket.on("move.made", function (data) {
    // Make the move
    $("#" + data.position).text(data.symbol);

    // If the symbol is the same as the player's symbol, we can assume it's their turn.
    myTurn = data.symbol !== symbol;

    // If the game is still going, display who's turn it is
    if (!isGameOver()) {
      if (gameTied()) {
        $("#messages").text("Game tied!");
        $(".board button").attr("disabled", true);
      } else {
        renderTurnMessage();
      }
      // When the game ends
    } else {
      if (myTurn) {
        // Message for the loser
        $("#messages").text("Game over. You lost !");
        alert("Highscore : " + tic_tac_toe_highscore);
        save_score(tic_tac_toe_highscore);
      } else {
        // Message for the winner
        $("#messages").text("Game over. You won !");
        tic_tac_toe_highscore++;
        alert("Highscore : " + tic_tac_toe_highscore);
        save_score(tic_tac_toe_highscore);
      }

      // Disable the game board or board
      $(".board button").attr("disabled", true);
    }
  });

  // Initial state when the game starts
  socket.on("game.begin", function (data) {
    // The server will assign a symbol to each player (X or O)
    symbol = data.symbol;
    // Deliver the X to the player with first turn
    myTurn = symbol === "X";
    renderTurnMessage();
  });

  // Disable board or board if one of the players disconnects
  socket.on("opponent.left", function () {
    $("#messages").text("Opponent disconnected.");
    $(".board button").attr("disabled", true);
  });
});

function getBoardState() {
  var obj = {};
  // Composing an object of all  Xs and Ox found in the table
  $(".board button").each(function () {
    obj[$(this).attr("id")] = $(this).text() || "";
  });
  return obj;
}

function gameTied() {
  var state = getBoardState();
  if (
    state.a0 !== "" &&
    state.a1 !== "" &&
    state.a2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.b3 !== "" &&
    state.c0 !== "" &&
    state.c1 !== "" &&
    state.c2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState(),
    // One of the rows must of be equal to one of these to end the game
    matches = ["XXX", "OOO"],
    // These are the possible combinations to win the game (row, column or diagonal) - by convention the letters a, b and c and are chosen
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2,
    ];

  // for both: XXX or OOO
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      return true;
    }
  }
}

function renderTurnMessage() {
  // Disable the table if it's the opponent's turn
  if (!myTurn) {
    $("#messages").text("Your opponent's turn.");
    $(".board button").attr("disabled", true);
    // Enable the table if it's your turn
  } else {
    $("#messages").text("Your turn.");
    $(".board button").removeAttr("disabled");
  }
}

function makeMove(e) {
  e.preventDefault();
  // It's not your turn
  if (!myTurn) {
    return;
  }
  // The box space is already selected
  if ($(this).text().length) {
    return;
  }

  // Send chosen move to server using socket.io "emit" event
  socket.emit("make.move", {
    symbol: symbol,
    position: $(this).attr("id"),
  });
}

function save_score(score) {
  window.localStorage.setItem("tic_tac_toe_highscore", score);
}

function display_score() {
  alert("Highscore : " + tic_tac_toe_highscore);
}
