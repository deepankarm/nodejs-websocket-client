#!/usr/bin/env node
const WebSocketClient = require('websocket').client;
const protobuf = require("protobufjs");

// *** 1. Create the actual message(buffer) that was transferred *** 
const root = protobuf.loadSync('./proto/jina.proto');
const DataRequest = root.lookupType('jina.DataRequestProto');

const request = DataRequest.create({
    data: {
        docs: {
            docs: [{
                text: 'hello'
            }]
        }
    }
})

const requestBuffer = DataRequest.encode(request).finish()

// *** 2. Create Websocket Client *** 
const client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }

        if (message.type === 'binary') {
            const response = DataRequest.decode(message.binaryData);
            console.log(JSON.stringify(DataRequest.toObject(response), null, 2))
        }
    });

    function sendMessage() {
        if (connection.connected) {
            connection.send(requestBuffer)
        }
    }
    // *** 3. Send the actual message *** 
    sendMessage();
});

client.connect('ws://localhost:12345/');