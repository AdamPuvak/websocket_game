<?php
use Workerman\Worker;
use Workerman\Connection\TcpConnection;

require_once __DIR__ . '/vendor/autoload.php';

$ws_worker = new Worker("websocket://127.0.0.1:8282");
$ws_worker->count = 1;

$connectedPlayers = 0;

$ws_worker->onConnect = function($connection) use (&$connectedPlayers, $ws_worker) {
    $connectedPlayers++;
    if($connectedPlayers>2) return;

    foreach ($ws_worker->connections as $conn) {
        $conn->send(json_encode(["connectedPlayers" => $connectedPlayers]));
    }
};

$ws_worker->onClose = function($connection) use (&$connectedPlayers, $ws_worker) {
    $connectedPlayers--;
};

$ws_worker->onMessage = function(TcpConnection $connection, $data) use ($ws_worker) {
    foreach ($ws_worker->connections as $conn) {
        $conn->send($data);
    }
};

Worker::runAll();
