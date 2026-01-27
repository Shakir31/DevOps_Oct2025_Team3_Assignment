const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const adminController = require("../controllers/adminController");
const authModel = require("../models/authModel");
const fileModel = require("../models/fileModel");
const adminModel = require("../models/adminModel");
const fs = require("fs");

jest.mock("../models/authModel");
jest.mock("../models/fileModel");
jest.mock("../models/adminModel");
jest.mock("fs");

describe("Integration Tests: Auth & File Operations", () => {
  let req, res;

  const mockUsers = {
    userA: {
      authId: "auth-user-a-id",
      userid: 1,
      email: "userA@example.com",
      username: "userA",
      role: "user",
      accessToken: "token-user-a",
    },
    userB: {
      authId: "auth-user-b-id",
      userid: 2,
      email: "userB@example.com",
      username: "userB",
      role: "user",
      accessToken: "token-user-b",
    },
    admin: {
      authId: "auth-admin-id",
      userid: 3,
      email: "admin@example.com",
      username: "adminUser",
      role: "admin",
      accessToken: "token-admin",
    },
  };

  const mockFiles = {
    fileA: {
      fileid: 1,
      userid: 1,
      filename: "doc-userA-12345.pdf",
      originalname: "document.pdf",
      filepath: "uploads/doc-userA-12345.pdf",
      filesize: 1024,
      mimetype: "application/pdf",
    },
    fileB: {
      fileid: 2,
      userid: 2,
      filename: "image-userB-67890.jpg",
      originalname: "photo.jpg",
      filepath: "uploads/image-userB-67890.jpg",
      filesize: 2048,
      mimetype: "image/jpeg",
    },
  };

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      headers: {},
      user: null,
      file: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      download: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("Scenario 1: Complete User Lifecycle with File Operations", () => {
    test("Should complete full workflow: register → login → upload → list → download → delete → logout", async () => {

      req.body = {
        email: mockUsers.userA.email,
        password: "password123",
        username: mockUsers.userA.username,
        role: "user",
      };

      authModel.registerUser.mockResolvedValue({
        authUser: { id: mockUsers.userA.authId },
        error: null,
      });

      authModel.createUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
        email: mockUsers.userA.email,
        username: mockUsers.userA.username,
        role: "user",
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
          user: expect.objectContaining({
            email: mockUsers.userA.email,
          }),
        })
      );
      expect(authModel.registerUser).toHaveBeenCalledWith(
        mockUsers.userA.email,
        "password123"
      );

      jest.clearAllMocks();

      req.body = {
        email: mockUsers.userA.email,
        password: "password123",
      };

      authModel.loginUser.mockResolvedValue({
        session: {
          access_token: mockUsers.userA.accessToken,
          refresh_token: "refresh-token-a",
        },
        user: { id: mockUsers.userA.authId },
        error: null,
      });

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
        email: mockUsers.userA.email,
        username: mockUsers.userA.username,
        role: "user",
      });

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          accessToken: mockUsers.userA.accessToken,
          user: expect.objectContaining({
            email: mockUsers.userA.email,
          }),
        })
      );

      req.user = { id: mockUsers.userA.authId };
      jest.clearAllMocks();

      req.file = {
        filename: mockFiles.fileA.filename,
        originalname: mockFiles.fileA.originalname,
        path: mockFiles.fileA.filepath,
        size: mockFiles.fileA.filesize,
        mimetype: mockFiles.fileA.mimetype,
      };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.createFileRecord.mockResolvedValue({
        fileid: mockFiles.fileA.fileid,
        userid: mockUsers.userA.userid,
        filename: mockFiles.fileA.filename,
        originalname: mockFiles.fileA.originalname,
      });

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "File uploaded successfully",
          file: expect.objectContaining({
            fileid: mockFiles.fileA.fileid,
          }),
        })
      );
      expect(fileModel.createFileRecord).toHaveBeenCalledWith(
        mockUsers.userA.userid,
        expect.objectContaining({
          filename: mockFiles.fileA.filename,
        })
      );

      jest.clearAllMocks();

      req.params = {};
      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      await fileController.getUserFiles(req, res);

      expect(res.json).toHaveBeenCalledWith({
        files: [mockFiles.fileA],
      });
      expect(fileModel.getUserFiles).toHaveBeenCalledWith(
        mockUsers.userA.userid
      );

      jest.clearAllMocks();

      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);
      fs.existsSync.mockReturnValue(true);

      await fileController.downloadFile(req, res);

      expect(fileModel.getFileById).toHaveBeenCalledWith(1);
      expect(res.download).toHaveBeenCalledWith(
        mockFiles.fileA.filepath,
        mockFiles.fileA.originalname
      );

      jest.clearAllMocks();

      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);
      fileModel.deleteFileRecord.mockResolvedValue();

      await fileController.deleteFile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "File deleted successfully",
      });
      expect(fileModel.deleteFileRecord).toHaveBeenCalledWith(
        mockFiles.fileA.fileid
      );

      jest.clearAllMocks();

      authModel.logoutUser.mockResolvedValue({ error: null });

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });

      jest.clearAllMocks();

      req.user = null;
      authModel.getUserProfile.mockRejectedValue(
        new Error("User not authenticated")
      );

      await fileController.getUserFiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch files",
      });
    });

    test("Should validate token flow from login to file operations", async () => {
      req.body = {
        email: mockUsers.userA.email,
        password: "password123",
      };

      let capturedToken = null;

      authModel.loginUser.mockResolvedValue({
        session: {
          access_token: mockUsers.userA.accessToken,
          refresh_token: "refresh-token-a",
        },
        user: { id: mockUsers.userA.authId },
        error: null,
      });

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
        email: mockUsers.userA.email,
        username: mockUsers.userA.username,
        role: "user",
      });

      res.json.mockImplementation((data) => {
        if (data.accessToken) {
          capturedToken = data.accessToken;
        }
      });

      await authController.login(req, res);

      expect(capturedToken).toBe(mockUsers.userA.accessToken);

      jest.clearAllMocks();
      req.user = { id: mockUsers.userA.authId };
      req.headers.authorization = `Bearer ${capturedToken}`;

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      await fileController.getUserFiles(req, res);

      expect(res.json).toHaveBeenCalledWith({
        files: [mockFiles.fileA],
      });
    });
  });

  describe("Scenario 2: Permission Boundary Validation", () => {
    test("UserA cannot download/delete UserB's files (403 Access Denied)", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "2" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileB);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });

      jest.clearAllMocks();

      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "2" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileB);

      await fileController.deleteFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });
    });

    test("Unauthenticated user cannot upload files (permission intercepted at model level)", async () => {

      req.file = {
        filename: "test.pdf",
        originalname: "test.pdf",
        path: "uploads/test.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      authModel.getUserProfile.mockRejectedValue(
        new Error("User not authenticated")
      );

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      expect(fs.unlink).toHaveBeenCalledWith(
        "uploads/test.pdf",
        expect.any(Function)
      );
    });

    test("Admin user can view all users and delete user disables their token", async () => {

      req.user = { id: mockUsers.admin.authId };

      adminModel.getAllUsers.mockResolvedValue([
        mockUsers.userA,
        mockUsers.userB,
        mockUsers.admin,
      ]);

      await adminController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        users: expect.arrayContaining([
          expect.objectContaining({ userid: mockUsers.userA.userid }),
          expect.objectContaining({ userid: mockUsers.userB.userid }),
        ]),
      });

      jest.clearAllMocks();

      req.user = { id: mockUsers.admin.authId };
      req.params = { id: "1" };

      adminModel.getUserById.mockResolvedValue({
        userid: mockUsers.userA.userid,
        authuserid: mockUsers.userA.authId,
      });

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.admin.userid,
        authid: mockUsers.admin.authId,
      });

      if (!adminModel.deleteAuthUser) {
        adminModel.deleteAuthUser = jest.fn();
      }
      adminModel.deleteAuthUser.mockResolvedValue();

      if (!adminModel.deleteUserProfile) {
        adminModel.deleteUserProfile = jest.fn();
      }
      adminModel.deleteUserProfile.mockResolvedValue();

      await adminController.deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User deleted successfully",
        })
      );

      jest.clearAllMocks();

      req.user = { id: mockUsers.userA.authId };

      authModel.getUserProfile.mockResolvedValue(null);

      await fileController.getUserFiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("User cannot access files after logout attempts (permission validation)", async () => {

      req.user = { id: mockUsers.userA.authId };

      authModel.getUserProfile.mockRejectedValue(new Error("Session expired"));

      await fileController.getUserFiles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch files",
      });
    });
  });

  describe("Scenario 3: Exception Flow Cross-Controller Validation", () => {
    test("Registered user cannot perform file operations without login token", async () => {

      req.user = null;
      req.file = {
        filename: "test.pdf",
        originalname: "test.pdf",
        path: "uploads/test.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      authModel.getUserProfile.mockRejectedValue(
        new Error("User not authenticated")
      );

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      expect(fs.unlink).toHaveBeenCalled();
    });

    test("After user deletion, file download should fail (user record deleted but token may still exist)", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue(null);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("Database insert failure during file upload triggers file cleanup and error response", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.file = {
        filename: "test.pdf",
        originalname: "test.pdf",
        path: "uploads/test.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.createFileRecord.mockRejectedValue(
        new Error("Database error")
      );

      fs.unlink.mockImplementation((path, callback) => {
        callback(null);
      });

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      expect(fs.unlink).toHaveBeenCalledWith(
        "uploads/test.pdf",
        expect.any(Function)
      );
    });

    test("File upload missing file triggers 400 error before database operation", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.file = null;

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No file uploaded",
      });

      expect(fileModel.createFileRecord).not.toHaveBeenCalled();

      expect(fs.unlink).not.toHaveBeenCalled();
    });

    test("File download with missing file on disk returns 404", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);

      fs.existsSync.mockReturnValue(false);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found on server",
      });

      expect(res.download).not.toHaveBeenCalled();
    });

    test("File not found in database returns 404 before permission check", async () => {

      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "999" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(null);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found",
      });
    });

    test("Registration validation catches missing fields before database operation", async () => {

      req.body = {
        password: "password123",
        username: "testuser",
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email, password, and username are required",
      });
      expect(authModel.registerUser).not.toHaveBeenCalled();

      jest.clearAllMocks();

      req.body = {
        email: "test@example.com",
        password: "12345",
        username: "testuser",
      };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Password must be at least 6 characters",
      });
      expect(authModel.registerUser).not.toHaveBeenCalled();
    });

    test("Login validation catches missing credentials before authentication", async () => {

      req.body = {
        password: "password123",
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
      expect(authModel.loginUser).not.toHaveBeenCalled();
    });

    test("Invalid credentials during login returns 401 without exposing system details", async () => {

      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      authModel.loginUser.mockResolvedValue({
        session: null,
        user: null,
        error: { message: "Invalid credentials" },
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });

  describe("Scenario 4: Data Consistency Across Controllers", () => {
    test("getUserProfile returns consistent data across auth and file operations", async () => {

      const expectedProfile = {
        userid: mockUsers.userA.userid,
        email: mockUsers.userA.email,
        username: mockUsers.userA.username,
        role: "user",
      };

      req.user = { id: mockUsers.userA.authId };

      authModel.getUserProfile.mockResolvedValue(expectedProfile);

      await authController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: expectedProfile.userid,
          email: expectedProfile.email,
          username: expectedProfile.username,
          role: expectedProfile.role,
        },
      });

      jest.clearAllMocks();

      authModel.getUserProfile.mockResolvedValue(expectedProfile);

      req.params = {};
      fileModel.getUserFiles.mockResolvedValue([]);

      await fileController.getUserFiles(req, res);

      expect(fileModel.getUserFiles).toHaveBeenCalledWith(expectedProfile.userid);
    });

    test("File ownership validation uses consistent user ID across operations", async () => {

      req.user = { id: mockUsers.userA.authId };

      const userProfile = { userid: mockUsers.userA.userid };

      req.file = {
        filename: mockFiles.fileA.filename,
        originalname: mockFiles.fileA.originalname,
        path: mockFiles.fileA.filepath,
        size: mockFiles.fileA.filesize,
        mimetype: mockFiles.fileA.mimetype,
      };

      authModel.getUserProfile.mockResolvedValue(userProfile);
      fileModel.createFileRecord.mockResolvedValue(mockFiles.fileA);

      await fileController.uploadFile(req, res);

      expect(fileModel.createFileRecord).toHaveBeenCalledWith(
        userProfile.userid,
        expect.any(Object)
      );

      jest.clearAllMocks();

      req.params = { id: "1" };
      authModel.getUserProfile.mockResolvedValue(userProfile);
      fileModel.getFileById.mockResolvedValue({
        ...mockFiles.fileA,
        userid: userProfile.userid,
      });
      fs.existsSync.mockReturnValue(true);

      await fileController.downloadFile(req, res);

      expect(fileModel.getFileById).toHaveBeenCalledWith(1);
      expect(res.download).toHaveBeenCalled();

      jest.clearAllMocks();

      req.params = { id: "1" };
      authModel.getUserProfile.mockResolvedValue(userProfile);
      fileModel.getFileById.mockResolvedValue({
        ...mockFiles.fileA,
        userid: userProfile.userid,
      });
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);
      fileModel.deleteFileRecord.mockResolvedValue();

      await fileController.deleteFile(req, res);

      expect(fileModel.deleteFileRecord).toHaveBeenCalledWith(
        mockFiles.fileA.fileid
      );
    });

    test("Token and user ID remain consistent throughout session", async () => {

      const sessionData = {
        authUserId: mockUsers.userA.authId,
        userid: mockUsers.userA.userid,
        token: mockUsers.userA.accessToken,
      };

      req.body = {
        email: mockUsers.userA.email,
        password: "password123",
      };

      authModel.loginUser.mockResolvedValue({
        session: { access_token: sessionData.token },
        user: { id: sessionData.authUserId },
        error: null,
      });

      authModel.getUserProfile.mockResolvedValue({
        userid: sessionData.userid,
      });

      await authController.login(req, res);

      req.user = { id: sessionData.authUserId };

      jest.clearAllMocks();

      req.file = {
        filename: mockFiles.fileA.filename,
        originalname: mockFiles.fileA.originalname,
        path: mockFiles.fileA.filepath,
        size: mockFiles.fileA.filesize,
        mimetype: mockFiles.fileA.mimetype,
      };

      authModel.getUserProfile.mockResolvedValue({
        userid: sessionData.userid,
      });
      fileModel.createFileRecord.mockResolvedValue(mockFiles.fileA);

      await fileController.uploadFile(req, res);

      expect(fileModel.createFileRecord).toHaveBeenCalledWith(
        sessionData.userid,
        expect.any(Object)
      );

      jest.clearAllMocks();

      authModel.getUserProfile.mockResolvedValue({
        userid: sessionData.userid,
      });
      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      await fileController.getUserFiles(req, res);

      expect(fileModel.getUserFiles).toHaveBeenCalledWith(sessionData.userid);

      jest.clearAllMocks();

      authModel.logoutUser.mockResolvedValue({ error: null });

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });

  describe("Scenario 5: Error Handling and Status Codes", () => {
    test("All auth operations use correct HTTP status codes", async () => {

      req.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };

      authModel.registerUser.mockResolvedValue({
        authUser: { id: "test-id" },
        error: null,
      });

      authModel.createUserProfile.mockResolvedValue({
        userid: 1,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      req.body = { password: "password123" };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      jest.clearAllMocks();

      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      authModel.loginUser.mockResolvedValue({
        session: { access_token: "token" },
        user: { id: "test-id" },
        error: null,
      });

      authModel.getUserProfile.mockResolvedValue({
        userid: 1,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      });

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalled();

      jest.clearAllMocks();

      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      authModel.loginUser.mockResolvedValue({
        session: null,
        user: null,
        error: { message: "Invalid" },
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("All file operations use correct HTTP status codes", async () => {

      req.user = { id: "test-user-id" };

      req.file = {
        filename: "test.pdf",
        originalname: "test.pdf",
        path: "uploads/test.pdf",
        size: 1024,
        mimetype: "application/pdf",
      };

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.createFileRecord.mockResolvedValue({
        fileid: 1,
        userid: 1,
        filename: "test.pdf",
      });

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      req.file = null;

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      jest.clearAllMocks();

      req.params = { id: "999" };

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getFileById.mockResolvedValue(null);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);

      jest.clearAllMocks();

      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getFileById.mockResolvedValue({
        fileid: 1,
        userid: 2,
      });

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      jest.clearAllMocks();

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getUserFiles.mockResolvedValue([]);

      await fileController.getUserFiles(req, res);

      expect(res.json).toHaveBeenCalledWith({ files: [] });
    });
  });
});