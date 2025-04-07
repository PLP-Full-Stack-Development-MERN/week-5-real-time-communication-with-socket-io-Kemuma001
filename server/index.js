const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let notes = {}; // Object to store notes per room
let users = {}; // Object to store users in each room

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // Handle joining a room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joining room: ${roomId}`);

    // Add user to room
    if (!users[roomId]) {
      users[roomId] = [];
    }
    users[roomId].push(socket.id);

    // Send list of users in the room to all clients
    io.to(roomId).emit("roomUsers", users[roomId]);

    // Send the current note for the room
    if (notes[roomId]) {
      socket.emit("noteUpdated", notes[roomId]);
    }
  });

  // Handle note updates
  socket.on("updateNote", (newNote, roomId) => {
    notes[roomId] = newNote;
    io.to(roomId).emit("noteUpdated", newNote); // Send update to all users in the room
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected:", socket.id);

    // Remove user from room
    for (let roomId in users) {
      users[roomId] = users[roomId].filter((id) => id !== socket.id);
      io.to(roomId).emit("roomUsers", users[roomId]);
    }
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
