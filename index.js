import express from "express";
import route from "./routes/agenda.js";
import { swaggerDocs } from "./swagger.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
app.use(cors(["http://localhost:5173"]));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
swaggerDocs(app);

// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'coba.html'));
// });

app.use("/agenda", route);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Atau spesifik ke asal yang Anda inginkan
    methods: ["GET", "POST"],
  }
});
const users = [
  {
    id: 0,
    name: "Ajang",
  },
  {
    id: 1,
    name: "Salim",
  },
  {
    id: 2,
    name: "Aditia",
  },
];

let connectedUsers = [];
let chatSessions = {}; // Objek untuk menyimpan sesi chat

io.on("connection", (socket) => {
  socket.on("registered user", (data) => {
    const user = users.find((usr) => usr.id === parseInt(data.userId));
    if (user && !connectedUsers.find((usr) => usr.id === user.id)) {
      connectedUsers.push({ ...user, socket_id: socket.id });
      console.log("User registered:", socket.id);
    }
  });

  socket.on("start chat", (data) => {
    const { userId } = data;
    const admin = connectedUsers.find((usr) => usr.id === 1); // Cari admin

    if (admin) {
      const user = connectedUsers.find((usr) => usr.id === parseInt(userId));

      if (user && user.id !== 1) {
        // Buat sesi chat baru
        const sessionId = `${Math.min(userId, 1)}-${Math.max(userId, 1)}`; // ID sesi chat

        // Cek jika sesi sudah ada
        if (!chatSessions[sessionId]) {
          chatSessions[sessionId] = {admin, user};
          console.log(`Chat session started between ${admin.name} and ${user.name}`);
        } else {
          console.log(`Chat session already exists between ${admin.name} and ${user.name}`);
        }
      }
    }
  });

  socket.on("private message", (data) => {
    const { senderId, receiverId, msg } = data;
    const sessionId = `${Math.min(senderId, receiverId)}-${Math.max(senderId, receiverId)}`;
    const session = chatSessions[sessionId];

    if (session) {
      const sender = connectedUsers.find((usr) => usr.id === parseInt(senderId));
      const receiver = connectedUsers.find((usr) => usr.id === parseInt(receiverId));

      console.log(`Message to ${receiver.name}: ${msg}`);
      io.to(receiver.socket_id).emit("private message", { user: sender, msg });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected, ", reason);
    connectedUsers = connectedUsers.filter((usr) => usr.socket_id !== socket.id);
    console.log("Updated connected users:", connectedUsers);
  });
});

server.listen(3000, () => {
  console.log("Server Start");
});
