var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var playerSize = 10;
var playerID = 0;

var player1Name = document.getElementById("player1-name");
var player2Name = document.getElementById("player2-name");

var player1Position;
var player2Position;

var player1Tail = [];
var player2Tail = [];

var player1Field = [];
var player2Field = [];


var ws = new WebSocket("ws://127.0.0.1:8282");

ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    // Initialization
    if (data.hasOwnProperty("connectedPlayers")) {
        if(playerID === 0) playerID = data.connectedPlayers;
        initializePlayer(data.connectedPlayers);
        if(playerID === 1) startModal.style.display = "block";
        if(playerID === 2) startModal2.style.display = "block";
    }
    else {
        var player1FieldSize = player1Field.length * 100;
        var player1PercentageValue = (player1FieldSize / (500 * 500)) * 100;

        var player2FieldSize = player2Field.length * 100;
        var player2PercentageValue = (player2FieldSize / (500 * 500)) * 100;

        console.log(player1FieldSize, " ", player2FieldSize);

        player1Percentage.textContent = player1PercentageValue.toFixed(2) + "%";
        player2Percentage.textContent = player2PercentageValue.toFixed(2) + "%";
    }

    // Game start
    if (data.type === "gameStart") {
        if(playerID === 1) startModal.style.display = "none";
        if(playerID === 2) startModal2.style.display = "none";
    }

    // Game start
    if (data.type === "countdown") {
        timerValue.textContent = data.remainingTime;
    }

    // Player move
    if (data.type === "playerMove") {
        var isInField = false;

        if(data.player === 1){
            player1Position = data.position;
            for (var i = 0; i < player1Field.length; i++) {
                var fieldTile = player1Field[i];
                if(data.previousTile.x === fieldTile.x && data.previousTile.y === fieldTile.y) isInField = true;
            }
            if(!isInField) player1Tail.push(data.previousTile);
        }
        else if (data.player === 2){
            player2Position = data.position;
            for (var i = 0; i < player2Field.length; i++) {
                var fieldTile = player2Field[i];
                if(data.previousTile.x === fieldTile.x && data.previousTile.y === fieldTile.y) isInField = true;
            }
            if(!isInField) player2Tail.push(data.previousTile);
        }

        redrawCanvas();
    }

    // Player move
    if (data.type === "fieldExpansion") {

        if (data.player === 1) {
            player1Position = data.position;
            player1Field = data.playerField;
            player1Tail = [];

            player2Field = player2Field.filter(function(fieldTile) {
                for (var i = 0; i < player1Field.length; i++) {
                    if (player1Field[i].x === fieldTile.x && player1Field[i].y === fieldTile.y) {
                        return false;
                    }
                }
                return true;
            });
        }
        else if (data.player === 2){
            player2Position = data.position;
            player2Field = data.playerField;
            player2Tail = [];

            player1Field = player1Field.filter(function(fieldTile) {
                for (var i = 0; i < player2Field.length; i++) {
                    if (player2Field[i].x === fieldTile.x && player2Field[i].y === fieldTile.y) {
                        return false;
                    }
                }
                return true;
            });
        }

        redrawCanvas();
    }

    // Game over
    if (data.type === "gameOver") {
        var winner;
        //console.log("ID: ", playerID, " - TERAZ");
        if(data.player === 1) winner = 2;
        else if(data.player === 2) winner = 1;

        gameOver(winner);
    }
};

function initializePlayer(connectedPlayers) {
    player1Position = {x: 50, y: 450};
    player2Position = {x: 450, y: 50};

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            player1Field.push({x: player1Position.x-10+(10*i), y: player1Position.y-10+(10*j)})
            player2Field.push({x: player2Position.x-10+(10*i), y: player2Position.y-10+(10*j)})
        }
    }

    if (connectedPlayers === 1) {
        player1Name.style.display = "block";
        player2Name.style.display = "none";
        drawPlayer(player1Position, "red");
        drawField(player1Field, "red");
    }
    else if (connectedPlayers === 2) {
        player1Name.style.display = "block";
        player2Name.style.display = "block";
        drawPlayer(player1Position, "red");
        drawPlayer(player2Position, "blue");
        drawField(player1Field, "red");
        drawField(player2Field, "blue");
    }
}

// Player move
document.addEventListener("keydown", function(event) {
    var step = 10;
    var playerPosition;
    var playerField;
    var playerTail;
    var message;


    if(playerID === 1){
        playerPosition = player1Position;
        playerField = player1Field;
        playerTail = player1Tail;
    }
    else if(playerID === 2){
        playerPosition = player2Position;
        playerField = player2Field;
        playerTail = player2Tail;
    }


    var previousPosition = { x: playerPosition.x, y: playerPosition.y };

    switch(event.keyCode) {
        case 37: // vľavo
            playerPosition.x -= step;
            break;
        case 38: // hore
            playerPosition.y -= step;
            break;
        case 39: // vpravo
            playerPosition.x += step;
            break;
        case 40: // dole
            playerPosition.y += step;
            break;
    }


    // Kontrola kolízie
    var collisionWith1 = player1Tail.some(function(position) {
        return position.x === playerPosition.x && position.y === playerPosition.y;
    });

    var collisionWith2 = player2Tail.some(function(position) {
        return position.x === playerPosition.x && position.y === playerPosition.y;
    });


    // Rozšírenie pola
    var prevIsInField = false;
    var newIsInField = false;

    for (var i = 0; i < playerField.length; i++) {
        var fieldTile = playerField[i];
        // stara pozicia nie je v poli
        if(previousPosition.x === fieldTile.x && previousPosition.y === fieldTile.y) prevIsInField = true;
        // nova pozicia je v poli
        if(playerPosition.x === fieldTile.x && playerPosition.y === fieldTile.y) newIsInField = true;
    }


    if (collisionWith1) {
        message = {
            type: "gameOver",
            player: 1,
        };
    }
    else if (collisionWith2) {
        message = {
            type: "gameOver",
            player: 2,
        };
    }
    else if(!prevIsInField && newIsInField) {      // Ak uzavrel stopu
        playerTail.forEach(function(tailTile) {
            if (!playerField.some(function(fieldTile) {
                return fieldTile.x === tailTile.x && fieldTile.y === tailTile.y;
            })) {
                playerField.push(tailTile);
            }
            playerField.push(previousPosition);
        });

        var checked_X = [];

        playerField.forEach(function(fieldTile_1) {
            if (!checked_X.includes(fieldTile_1.x)) {
                var lowest_Y = 500;
                var highest_Y = 0;
                // najdenie ypsilonov
                playerField.forEach(function(fieldTile_2) {
                    if(fieldTile_2.x === fieldTile_1.x){
                        if(fieldTile_2.y < lowest_Y) lowest_Y = fieldTile_2.y;
                        if(fieldTile_2.y > highest_Y) highest_Y = fieldTile_2.y;
                    }
                });


                var y_differnce = (highest_Y - lowest_Y) / playerSize;
                var addedTile;
                // vyplnenie stlpca
                for(var i = 1; i<=y_differnce; i++){
                    addedTile = {x:fieldTile_1.x, y:lowest_Y+(i*10)}
                    if (!playerField.some(function(fieldTile) {
                        return fieldTile.x === addedTile.x && fieldTile.y === addedTile.y;
                    })) {
                        playerField.push(addedTile);
                    }
                }

                checked_X.push(fieldTile_1.x);
            }
        });


        message = {
            type: "fieldExpansion",
            player: playerID,
            position: playerPosition,
            playerField: playerField,
        };
    }
    else {
        message = {
            type: "playerMove",
            player: playerID,
            position: playerPosition,
            previousTile: previousPosition
        };
    }
    ws.send(JSON.stringify(message));
});


// DRAW funkcie
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer(player1Position, "red");
    drawPlayer(player2Position, "blue");

    drawField(player1Field, "red");
    drawField(player2Field, "blue");

    drawTail(player1Tail, "#FAA0A0");
    drawTail(player2Tail, "#89CFF0");
}

function drawPlayer(position, color) {
    ctx.fillStyle = color;
    ctx.fillRect(position.x, position.y, playerSize, playerSize);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(position.x, position.y, playerSize, playerSize);
}

function drawTail(tail, color) {
    ctx.fillStyle = color;

    tail.forEach(function(position) {
        ctx.fillRect(position.x, position.y, playerSize, playerSize);
    });
}

function drawField(field, color){
    ctx.fillStyle = color;

    field.forEach(function(tile) {
        if(tile.x === player1Position.x && tile.y === player1Position.y){
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.strokeRect(tile.x, tile.y, playerSize, playerSize);
            ctx.fillStyle = "red";
        }
        else if(tile.x === player2Position.x && tile.y === player2Position.y){
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.strokeRect(tile.x, tile.y, playerSize, playerSize);
            ctx.fillStyle = "blue";
        }
        else {
            ctx.fillStyle = color;
        }

        ctx.fillRect(tile.x, tile.y, playerSize, playerSize);
    });
}


// UTILITIES
var startModal = document.getElementById("gameStartModal");
var startModal2 = document.getElementById("gameStartModal2");
var gameTimeInput = document.getElementById("gameTimeInput");
var timerValue = document.getElementById("timerValue");
var startGameButton = document.getElementById("startGameButton");
var player1Percentage = document.getElementById("player1-percentage");
var player2Percentage = document.getElementById("player2-percentage");

var countdownInterval;
var remainingTime;


startGameButton.addEventListener("click", function() {
    var timeInSeconds = parseInt(gameTimeInput.value);
    startCountdown(timeInSeconds);

    message = {
        type: "gameStart",

    };

    ws.send(JSON.stringify(message));
});

function startCountdown(timeInSeconds) {
    remainingTime = timeInSeconds;

    countdownInterval = setInterval(function() {

        remainingTime--;

        message = {
            type: "countdown",
            remainingTime: remainingTime,
        };
        ws.send(JSON.stringify(message));

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);

            var player1FieldSize = player1Field.length * 100;
            var player1PercentageValue = (player1FieldSize / (500 * 500)) * 100;

            var player2FieldSize = player2Field.length * 100;
            var player2PercentageValue = (player2FieldSize / (500 * 500)) * 100;

            if(player1PercentageValue > player2PercentageValue){
                message = {
                    type: "gameOver",
                    player: 2,
                };
                ws.send(JSON.stringify(message));
            }
            else
            {
                message = {
                    type: "gameOver",
                    player: 1,
                };
                ws.send(JSON.stringify(message));
            }
        }
    }, 1000);
}

function gameOver(winner) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var modal = document.getElementById("gameOverModal");
    modal.style.display = "block";

    var modalContent = modal.querySelector(".modal-content");
    modalContent.innerHTML = "<h2>Game Over</h2>";
    modalContent.innerHTML += "<p>Winner: Player " + winner + "</p>";
}



