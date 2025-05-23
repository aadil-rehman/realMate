require("dotenv").config();
const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const http = require("http");

const cors = require("cors");

require("./utils/cronJob");

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const uploadRouter = require("./routes/upload");
const blogRouter = require("./routes/blogs");
const commentsRouter = require("./routes/comments");
const likesRouter = require("./routes/likes");
const chatRouter = require("./routes/chat");
const initializeSocket = require("./utils/socket");

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/image", uploadRouter);
app.use("/blog", blogRouter);
app.use("/comments", commentsRouter);
app.use("/likes", likesRouter);
app.use("/chat", chatRouter);

const server = http.createServer(app);

initializeSocket(server);

mongoDBconnect()
	.then(() => {
		console.log("Database connection established");
		server.listen(3000, () => {
			console.log("Server is listening on port 3000...");
		});
	})
	.catch(() => {
		console.log("Database cannot be connected");
	});
