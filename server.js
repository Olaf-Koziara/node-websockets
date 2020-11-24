"use strict";

const express = require("express");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const INDEX = "/index.html";

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocket.Server({ server });
wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4();
};
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));
  if (!ws.id) {
    ws.id = wss.getUniqueID();
  }
  wss.clients.forEach((client) => {
    console.log(client.id);
    client.send(JSON.stringify({ uid: client.id }));
  });
  ws.on("message", (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        const uid = JSON.parse(data).uid;

        if (uid === client.id) {
          client.send(data);
        }
      }
    });
  });
});
