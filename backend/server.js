require("dotenv").config({ path: "../.env" });

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const { connectDb } = require('./config/db');
const setupSocketHandler = require('./sockets/socketHandler');

const dashboardRoutes = require('./routes/dashboardRoutes'); 
const supplyRoutes = require('./routes/supplyRoutes');

const createSimulateRouter = require("./routes/simulate");
const disruptionsRouter = require('./routes/disruptions');
const liveStreamRouter = require('./routes/liveStream');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// ✅ ONLY ONE dashboard route
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplyRoutes);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Store io globally
app.set("io", io);

setupSocketHandler(io);

// Routes
app.use("/simulate", createSimulateRouter());
app.use('/api/disruptions', disruptionsRouter);
app.use('/api/live-stream', liveStreamRouter());

const PORT = process.env.PORT || 4000;

connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});