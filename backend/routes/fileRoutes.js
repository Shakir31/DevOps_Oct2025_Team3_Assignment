const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fileController = require("../controllers/fileController");
const { authenticateToken } = require("../middleware/authMiddleware");

//create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    //generate unique filename(timestamp-randomstring-originalname)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + "-" + uniqueSuffix + ext);
  },
});

//file filter(add restrictions if needed)
const fileFilter = (req, file, cb) => {
  // Accept all files for now(can add restrictions later on if needed)
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, //10MB max file size
  },
});

//all routes require authentication
router.use(authenticateToken);

router.get("/", fileController.getUserFiles);

router.post("/upload", upload.single("file"), fileController.uploadFile);

router.get("/download/:id", fileController.downloadFile);

router.delete("/delete/:id", fileController.deleteFile);

module.exports = router;
