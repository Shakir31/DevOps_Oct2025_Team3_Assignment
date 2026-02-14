const fileController = require("../controllers/fileController");
const fileModel = require("../models/fileModel");
const authModel = require("../models/authModel");
const fs = require("fs");

//mock the models and fs
jest.mock("../models/fileModel");
jest.mock("../models/authModel");
jest.mock("fs");

describe("File Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: "test-user-auth-id" },
      file: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      download: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getUserFiles", () => {
    test("should get user files successfully", async () => {
      //arrange
      const mockUserProfile = { userid: 1 };
      const mockFiles = [
        { fileid: 1, filename: "file1.pdf", originalname: "document1.pdf" },
        { fileid: 2, filename: "file2.pdf", originalname: "document2.pdf" },
      ];

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getUserFiles.mockResolvedValue(mockFiles);

      //act
      await fileController.getUserFiles(req, res);

      //assert
      expect(authModel.getUserProfile).toHaveBeenCalledWith(
        "test-user-auth-id"
      );
      expect(fileModel.getUserFiles).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ files: mockFiles });
    });

    test("should handle error when getting files", async () => {
      //arrange
      console.log('[TEST] Expected behavior: Throwing fake "Database error" to verify getUserFiles handles it correctly');
      authModel.getUserProfile.mockRejectedValue(new Error("Database error"));

      //act
      await fileController.getUserFiles(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch files",
      });
    });
  });

  describe("uploadFile", () => {
    test("should upload file successfully", async () => {
      //arrange
      req.file = {
        filename: "document-1234567890.pdf",
        originalname: "document.pdf",
        path: "uploads/document-1234567890.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      const mockUserProfile = { userid: 1 };
      const mockFileRecord = {
        fileid: 1,
        userid: 1,
        filename: "document-1234567890.pdf",
        originalname: "document.pdf",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.createFileRecord.mockResolvedValue(mockFileRecord);

      //act
      await fileController.uploadFile(req, res);

      //assert
      expect(fileModel.createFileRecord).toHaveBeenCalledWith(1, {
        filename: "document-1234567890.pdf",
        originalname: "document.pdf",
        filepath: "uploads/document-1234567890.pdf",
        filesize: 1024,
        mimetype: "application/pdf",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "File uploaded successfully",
        file: mockFileRecord,
      });
    });

    test("should return 400 if no file uploaded", async () => {
      //arrange
      req.file = null;

      //act
      await fileController.uploadFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No file uploaded",
      });
    });

    test("should delete file if database insert fails", async () => {
      //arrange
      req.file = {
        filename: "document-1234567890.pdf",
        originalname: "document.pdf",
        path: "uploads/document-1234567890.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      const mockUserProfile = { userid: 1 };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      console.log('[TEST] Expected behavior: Throwing fake "Database error" to verify file cleanup on failure');
      fileModel.createFileRecord.mockRejectedValue(new Error("Database error"));
      fs.unlink.mockImplementation((path, callback) => callback(null));

      //act
      await fileController.uploadFile(req, res);

      //assert
      expect(fs.unlink).toHaveBeenCalledWith(
        "uploads/document-1234567890.pdf",
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("downloadFile", () => {
    test("should download file successfully", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUserProfile = { userid: 1 };
      const mockFile = {
        fileid: 1,
        userid: 1,
        filename: "document-1234567890.pdf",
        originalname: "document.pdf",
        filepath: "uploads/document-1234567890.pdf",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(mockFile);
      fs.existsSync.mockReturnValue(true);

      //act
      await fileController.downloadFile(req, res);

      //assert
      expect(fileModel.getFileById).toHaveBeenCalledWith(1);
      expect(fs.existsSync).toHaveBeenCalledWith(
        "uploads/document-1234567890.pdf"
      );
      expect(res.download).toHaveBeenCalledWith(
        "uploads/document-1234567890.pdf",
        "document.pdf"
      );
    });

    test("should return 404 if file not found in database", async () => {
      //arrange
      req.params = { id: "999" };

      const mockUserProfile = { userid: 1 };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(null);

      //act
      await fileController.downloadFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found",
      });
    });

    test("should return 403 if user does not own file", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUserProfile = { userid: 1 };
      const mockFile = {
        fileid: 1,
        userid: 2, //different user
        filename: "document-1234567890.pdf",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(mockFile);

      //act
      await fileController.downloadFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });
    });

    test("should return 404 if file not found on disk", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUserProfile = { userid: 1 };
      const mockFile = {
        fileid: 1,
        userid: 1,
        filepath: "uploads/document-1234567890.pdf",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(mockFile);
      fs.existsSync.mockReturnValue(false);

      //act
      await fileController.downloadFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found on server",
      });
    });
  });

  describe("deleteFile", () => {
    test("should delete file successfully", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUserProfile = { userid: 1 };
      const mockFile = {
        fileid: 1,
        userid: 1,
        filepath: "uploads/document-1234567890.pdf",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(mockFile);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);
      fileModel.deleteFileRecord.mockResolvedValue();

      //act
      await fileController.deleteFile(req, res);

      //assert
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        "uploads/document-1234567890.pdf"
      );
      expect(fileModel.deleteFileRecord).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "File deleted successfully",
      });
    });

    test("should return 404 if file not found", async () => {
      //arrange
      req.params = { id: "999" };

      const mockUserProfile = { userid: 1 };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(null);

      //act
      await fileController.deleteFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found",
      });
    });

    test("should return 403 if user does not own file", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUserProfile = { userid: 1 };
      const mockFile = {
        fileid: 1,
        userid: 2, //different user
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);
      fileModel.getFileById.mockResolvedValue(mockFile);

      //act
      await fileController.deleteFile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });
    });
  });
});
