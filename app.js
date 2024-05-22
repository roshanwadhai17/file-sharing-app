import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 5001; // Changed the port to 5001

// Configure Server Path name
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serving static files using express
app.use(express.static(join(__dirname, "public")));

// Getting the server instance from express.
const expServer = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Using that Express server to work with socket connection
const io = new Server(expServer);

// When a new client connects to the server using Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for the "sender-join" event from the client
  socket.on("sender-join", (data) => {
    console.log("Sender joined with UID:", data.uid);
    socket.join(data.uid);
  });

  // Listen for the "receiver-join" event from the client
  socket.on("receiver-join", (data) => {
    console.log("Receiver joined with UID:", data.uid);
    socket.join(data.uid);
    socket.to(data.sender_uid).emit("init", data.uid);
  });

  // Listen for the "file-meta" event from the client
  socket.on("file-meta", (data) => {
    console.log("File meta received:", data);
    socket.to(data.uid).emit("fs-meta", data.metadata);
  });

  // Listen for the "fs-start" event from the client
  socket.on("fs-start", (data) => {
    socket.to(data.uid).emit("fs-share", {});
  });

  // Listen for the "file-raw" event from the client
  socket.on("file-raw", (data) => {
    socket.to(data.uid).emit("fs-share", data.buffer);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
