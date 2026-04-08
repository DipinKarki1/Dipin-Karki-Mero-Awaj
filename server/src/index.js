import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import auth from "./routes/auth.js";
import issues from "./routes/issues.js";
import messages from "./routes/messages.js";
import awareness from "./routes/awareness.js";
import admin from "./routes/admin.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const normalizeOrigin = (origin) => (origin ? origin.trim().replace(/\/+$/, "") : "");

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(normalizeOrigin)
  : [];
const allowedOrigins = [...new Set([...envOrigins, "http://localhost:5173"].map(normalizeOrigin))]
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.use(cors(corsOptions));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// Socket.io logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinIssueRoom", (issueId) => {
    socket.join(issueId);
    console.log(`User ${socket.id} joined room: ${issueId}`);

    // Broadcast participant count (simplified for now)
    const count = io.sockets.adapter.rooms.get(issueId)?.size || 0;
    io.to(issueId).emit("ticketRoomParticipants", { ticketId: issueId, count });
  });

  socket.on("sendMessage", (messageData) => {
    // Broadcast the message to everyone in the room except the sender
    socket.to(messageData.issue).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/issues", issues);
app.use("/api/v1/messages", messages);
app.use("/api/v1/awareness", awareness);
app.use("/api/v1/admin", admin);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Basic error handler (e.g., multer file errors)
app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Image too large (max 5MB)" });
  }
  if (err?.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: "Server error" });
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

const ensureAdminUser = async () => {
  const adminEmail = "admin@meroawaj.com";
  const adminPassword = "awajadmin@8";
  const adminName = "Admin";

  const existing = await User.findOne({ email: adminEmail }).select("+password");

  if (!existing) {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      emailVerified: true,
    });
    console.log("Seeded default admin user:", adminEmail);
    return;
  }

  let needsSave = false;

  if (existing.role !== "admin") {
    existing.role = "admin";
    needsSave = true;
  }

  if (!existing.emailVerified) {
    existing.emailVerified = true;
    needsSave = true;
  }

  if (!existing.name) {
    existing.name = adminName;
    needsSave = true;
  }

  const passwordMatches = await existing.matchPassword(adminPassword);
  if (!passwordMatches) {
    existing.password = adminPassword;
    needsSave = true;
  }

  if (needsSave) {
    await existing.save();
    console.log("Updated default admin credentials for:", adminEmail);
  }
};

const ensureAuthorityUsers = async () => {
  const authoritySeeds = [
    {
      name: "Road Authority",
      email: "roadmeroawaj@gmail.com",
      password: "password@1",
      authorityCategory: "Road",
    },
    {
      name: "Water Authority",
      email: "watermeroawaj@gmail.com",
      password: "password@2",
      authorityCategory: "Water",
    },
    {
      name: "Electricity Authority",
      email: "electricitymeroawaj@gmail.com",
      password: "password@3",
      authorityCategory: "Electricity",
    },
  ];

  for (const seed of authoritySeeds) {
    const existing = await User.findOne({ email: seed.email }).select("+password");

    if (!existing) {
      await User.create({
        name: seed.name,
        email: seed.email,
        password: seed.password,
        role: "authority",
        authorityCategory: seed.authorityCategory,
        emailVerified: true,
      });
      console.log("Seeded authority user:", seed.email);
      continue;
    }

    let needsSave = false;

    if (existing.role !== "authority") {
      existing.role = "authority";
      needsSave = true;
    }

    if (existing.authorityCategory !== seed.authorityCategory) {
      existing.authorityCategory = seed.authorityCategory;
      needsSave = true;
    }

    if (!existing.emailVerified) {
      existing.emailVerified = true;
      needsSave = true;
    }

    if (!existing.name || existing.name !== seed.name) {
      existing.name = seed.name;
      needsSave = true;
    }

    const passwordMatches = await existing.matchPassword(seed.password);
    if (!passwordMatches) {
      existing.password = seed.password;
      needsSave = true;
    }

    if (needsSave) {
      await existing.save();
      console.log("Updated authority credentials for:", seed.email);
    }
  }
};

// Start server first
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);

  console.log("Connecting to MongoDB...");

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("Connected to MongoDB successfully!");
      await ensureAdminUser();
      await ensureAuthorityUsers();
    })
    .catch((err) => {
      console.error("CRITICAL: MongoDB connection error:", err.message);
      if (mongoUri.includes("localhost")) {
        console.log("Note: Still attempting to connect to localhost. Check if .env is loaded correctly.");
      }
    });
});




