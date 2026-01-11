const fileModel = require("../models/fileModel");
const authModel = require("../models/authModel");
const fs = require("fs");
const path = require("path");

//get all files for current user
async function getUserFiles(req, res) {
  try {
    const userProfile = await authModel.getUserProfile(req.user.id);
    const files = await fileModel.getUserFiles(userProfile.userid);

    res.json({ files });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}

//upload file
async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userProfile = await authModel.getUserProfile(req.user.id);

    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
    };

    const fileRecord = await fileModel.createFileRecord(
      userProfile.userid,
      fileData
    );

    res.status(201).json({
      message: "File uploaded successfully",
      file: fileRecord,
    });
  } catch (error) {
    console.error("Upload file error:", error);

    //delete uploaded file if database insert fails (so no file will be left untracked)
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }

    res.status(500).json({ error: "Failed to upload file" });
  }
}

//download file
async function downloadFile(req, res) {
  try {
    const fileId = parseInt(req.params.id, 10);
    const userProfile = await authModel.getUserProfile(req.user.id);

    const file = await fileModel.getFileById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    //check if file belongs to current user
    if (file.userid !== userProfile.userid) {
      return res.status(403).json({ error: "Access denied" });
    }

    //check if file exists on disk
    if (!fs.existsSync(file.filepath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    res.download(file.filepath, file.originalname);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
}

//delete file
async function deleteFile(req, res) {
  try {
    const fileId = parseInt(req.params.id, 10);
    const userProfile = await authModel.getUserProfile(req.user.id);

    const file = await fileModel.getFileById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    //check if file belongs to current user
    if (file.userid !== userProfile.userid) {
      return res.status(403).json({ error: "Access denied" });
    }

    //delete file from disk
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }

    //delete file record from database
    await fileModel.deleteFileRecord(fileId);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
}

module.exports = {
  getUserFiles,
  uploadFile,
  downloadFile,
  deleteFile,
};
