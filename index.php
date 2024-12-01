<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paper.io (2.0)</title>
    <link rel="stylesheet" type="text/css" href="CSS/styles.css">
    <link rel="shortcut icon" href="#">
</head>
<body>
<header>
    <h1>Paper.io (2.0)</h1>
</header>

<canvas id="gameCanvas" width="500" height="500"></canvas>

<div id="gameOverModal" class="modal">
    <div class="modal-content">
        <h2>Game Over</h2>
    </div>
</div>

<div id="gameStartModal" class="modal" style="display: none;">
    <div class="modal-content">
        <h2>Paper.io (2.0)</h2>
        <input type="text" id="gameTimeInput" placeholder="Enter time in seconds">
        <button id="startGameButton">Start Game</button>
    </div>
</div>

<div id="gameStartModal2" class="modal" style="display: none;">
    <div class="modal-content">
        <h2>Paper.io (2.0)</h2>
        <p>Please wait</p>
    </div>
</div>

<div class="player-info">
    <div id="timer">
        <p id="gameTimer">Time Remaining: <span id="timerValue">0</span> seconds</p>
    </div>
    <p id="player1-name" style="display: none; color: red; margin-bottom: -10px;">Player 1: <span id="player1-percentage"></span></p>
    <p id="player2-name" style="display: none; color: blue;">Player 2: <span id="player2-percentage"></span></p>
</div>

<script src="main.js"></script>

</body>
</html>