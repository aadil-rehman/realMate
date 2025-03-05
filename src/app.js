const express = require("express");

const app = express();

const { adminAuth, userAuth } = require("./middlewares/auth");

app.use("/admin", adminAuth);

app.get("/admin/getAllData", (req, res) => {
	res.send("All data sent");
});

app.get("/user", userAuth, (req, res) => {
	res.send("User data sent");
});

app.listen(3000, () => {
	console.log("Server is listening on port 3000...");
});
