const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

// Middleware to parse JSON request body
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

mongoDBconnect()
	.then(() => {
		console.log("Database connection established");
		app.listen(3000, () => {
			console.log("Server is listening on port 3000...");
		});
	})
	.catch(() => {
		console.log("Database cannot be connected");
	});
