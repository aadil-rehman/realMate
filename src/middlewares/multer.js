const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_FOLDER = path.join(__dirname, "../uploads");

// Make sure folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
	fs.mkdirSync(UPLOAD_FOLDER);
}

//save file to local storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_FOLDER);
	},
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + "-" + path.extname(file.originalname);
		cb(null, uniqueName);
	},
});

//file filter
const fileFilter = (req, file, cb) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed!"), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, //max 5MB
});

module.exports = upload;
