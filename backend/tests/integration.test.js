/**
 * 集成测试：认证-文件操作全流程
 * 测试目标：验证 authController 和 fileController 跨模块协作的有效性
 * 包括用户认证状态、权限管理、真实数据流转等
 */

const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");
const adminController = require("../controllers/adminController");
const authModel = require("../models/authModel");
const fileModel = require("../models/fileModel");
const adminModel = require("../models/adminModel");
const fs = require("fs");

// Mock 所有模型和 fs 模块
jest.mock("../models/authModel");
jest.mock("../models/fileModel");
jest.mock("../models/adminModel");
jest.mock("fs");

describe("Integration Tests: Auth & File Operations", () => {
  let req, res;

  // 通用 mock 数据
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

  // 测试前的设置
  beforeEach(() => {
    // 重置 request 和 response mock
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

    // 清空所有 mock 调用记录
    jest.clearAllMocks();
  });

  // ============ 场景 1：完整用户生命周期 + 文件操作（正向流程） ============
  describe("Scenario 1: Complete User Lifecycle with File Operations", () => {
    test("Should complete full workflow: register → login → upload → list → download → delete → logout", async () => {
      // ============ Step 1: 注册普通用户 ============
      // Arrange：设置注册请求
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

      // Act：执行注册
      await authController.register(req, res);

      // Assert：验证注册成功
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

      // 清空 mock 以进行下一步
      jest.clearAllMocks();

      // ============ Step 2: 登录获取令牌 ============
      // Arrange：设置登录请求
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

      // Act：执行登录
      await authController.login(req, res);

      // Assert：验证登录成功并返回令牌
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          accessToken: mockUsers.userA.accessToken,
          user: expect.objectContaining({
            email: mockUsers.userA.email,
          }),
        })
      );

      // 模拟登录后的用户状态（令牌附加到请求）
      req.user = { id: mockUsers.userA.authId };
      jest.clearAllMocks();

      // ============ Step 3: 上传文件 ============
      // Arrange：设置上传请求
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

      // Act：执行上传
      await fileController.uploadFile(req, res);

      // Assert：验证上传成功
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

      // ============ Step 4: 获取文件列表 ============
      // Arrange：设置获取文件列表请求
      req.params = {};
      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      // Act：执行获取文件列表
      await fileController.getUserFiles(req, res);

      // Assert：验证文件列表包含已上传文件
      expect(res.json).toHaveBeenCalledWith({
        files: [mockFiles.fileA],
      });
      expect(fileModel.getUserFiles).toHaveBeenCalledWith(
        mockUsers.userA.userid
      );

      jest.clearAllMocks();

      // ============ Step 5: 下载文件 ============
      // Arrange：设置下载请求
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);
      fs.existsSync.mockReturnValue(true);

      // Act：执行下载
      await fileController.downloadFile(req, res);

      // Assert：验证下载成功
      expect(fileModel.getFileById).toHaveBeenCalledWith(1);
      expect(res.download).toHaveBeenCalledWith(
        mockFiles.fileA.filepath,
        mockFiles.fileA.originalname
      );

      jest.clearAllMocks();

      // ============ Step 6: 删除文件 ============
      // Arrange：设置删除请求
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue(undefined);
      fileModel.deleteFileRecord.mockResolvedValue();

      // Act：执行删除
      await fileController.deleteFile(req, res);

      // Assert：验证删除成功
      expect(res.json).toHaveBeenCalledWith({
        message: "File deleted successfully",
      });
      expect(fileModel.deleteFileRecord).toHaveBeenCalledWith(
        mockFiles.fileA.fileid
      );

      jest.clearAllMocks();

      // ============ Step 7: 登出 ============
      // Arrange：设置登出请求
      authModel.logoutUser.mockResolvedValue({ error: null });

      // Act：执行登出
      await authController.logout(req, res);

      // Assert：验证登出成功
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });

      jest.clearAllMocks();

      // ============ Step 8: 登出后尝试访问文件操作 ============
      // Arrange：清除用户认证信息
      req.user = null;
      authModel.getUserProfile.mockRejectedValue(
        new Error("User not authenticated")
      );

      // Act：尝试获取文件列表
      await fileController.getUserFiles(req, res);

      // Assert：验证返回 500 错误（模型层错误）
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch files",
      });
    });

    test("Should validate token flow from login to file operations", async () => {
      // 验证登录返回的令牌可正确用于后续文件操作

      // 1. 登录并获取令牌
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

      // 捕获响应中的令牌
      res.json.mockImplementation((data) => {
        if (data.accessToken) {
          capturedToken = data.accessToken;
        }
      });

      await authController.login(req, res);

      // 验证令牌已返回
      expect(capturedToken).toBe(mockUsers.userA.accessToken);

      // 2. 使用令牌进行文件操作
      jest.clearAllMocks();
      req.user = { id: mockUsers.userA.authId };
      req.headers.authorization = `Bearer ${capturedToken}`;

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      await fileController.getUserFiles(req, res);

      // 验证使用令牌的用户可访问文件
      expect(res.json).toHaveBeenCalledWith({
        files: [mockFiles.fileA],
      });
    });
  });

  // ============ 场景 2：权限边界校验（反向流程） ============
  describe("Scenario 2: Permission Boundary Validation", () => {
    test("UserA cannot download/delete UserB's files (403 Access Denied)", async () => {
      // 场景：UserB 上传文件，UserA 尝试下载/删除

      // ============ 尝试下载他人文件 ============
      // Arrange：设置 UserA 的请求上下文
      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "2" }; // UserB 的文件 ID

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileB); // 返回 UserB 的文件

      // Act：UserA 尝试下载 UserB 的文件
      await fileController.downloadFile(req, res);

      // Assert：验证返回 403 禁止访问
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });

      jest.clearAllMocks();

      // ============ 尝试删除他人文件 ============
      // Arrange：重置 mock
      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "2" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileB);

      // Act：UserA 尝试删除 UserB 的文件
      await fileController.deleteFile(req, res);

      // Assert：验证返回 403 禁止访问
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied",
      });
    });

    test("Unauthenticated user cannot upload files (permission intercepted at model level)", async () => {
      // 场景：未登录用户直接调用上传接口

      // Arrange：模拟无认证状态（getUserProfile 返回错误）
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

      // Act：执行上传
      await fileController.uploadFile(req, res);

      // Assert：验证上传失败（无法获取用户信息）
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      // 验证文件被删除（数据库操作失败时的清理机制）
      expect(fs.unlink).toHaveBeenCalledWith(
        "uploads/test.pdf",
        expect.any(Function)
      );
    });

    test("Admin user can view all users and delete user disables their token", async () => {
      // 场景：管理员删除普通用户后，该用户的令牌失效

      // ============ Step 1: Admin 查看所有用户 ============
      req.user = { id: mockUsers.admin.authId };

      adminModel.getAllUsers.mockResolvedValue([
        mockUsers.userA,
        mockUsers.userB,
        mockUsers.admin,
      ]);

      // Act：获取所有用户
      await adminController.getAllUsers(req, res);

      // Assert：验证管理员可查看所有用户
      expect(res.json).toHaveBeenCalledWith({
        users: expect.arrayContaining([
          expect.objectContaining({ userid: mockUsers.userA.userid }),
          expect.objectContaining({ userid: mockUsers.userB.userid }),
        ]),
      });

      jest.clearAllMocks();

      // ============ Step 2: Admin 删除普通用户 ============
      req.user = { id: mockUsers.admin.authId }; // 设置当前用户为 admin
      req.params = { id: "1" }; // 删除 UserA

      adminModel.getUserById.mockResolvedValue({
        userid: mockUsers.userA.userid,
        authuserid: mockUsers.userA.authId,
      });

      // Mock authModel 的 getUserProfile（确认当前用户不是被删除的用户）
      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.admin.userid,
        authid: mockUsers.admin.authId,
      });

      // 确保 deleteAuthUser 和 deleteUserProfile 方法存在
      if (!adminModel.deleteAuthUser) {
        adminModel.deleteAuthUser = jest.fn();
      }
      adminModel.deleteAuthUser.mockResolvedValue();

      if (!adminModel.deleteUserProfile) {
        adminModel.deleteUserProfile = jest.fn();
      }
      adminModel.deleteUserProfile.mockResolvedValue();

      // Act：执行删除用户
      await adminController.deleteUser(req, res);

      // Assert：验证用户删除成功
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User deleted successfully",
        })
      );

      jest.clearAllMocks();

      // ============ Step 3: 已删除用户尝试操作文件 ============
      req.user = { id: mockUsers.userA.authId };

      // 模拟用户已被删除，getUserProfile 返回 null 或抛出错误
      authModel.getUserProfile.mockResolvedValue(null);

      // Act：尝试获取文件
      await fileController.getUserFiles(req, res);

      // Assert：验证访问被拒绝或返回错误
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("User cannot access files after logout attempts (permission validation)", async () => {
      // 场景：用户登出后，后续文件操作应失败

      // Arrange：设置已登出状态（getUserProfile 返回错误或无效数据）
      req.user = { id: mockUsers.userA.authId };

      authModel.getUserProfile.mockRejectedValue(new Error("Session expired"));

      // Act：尝试获取文件列表
      await fileController.getUserFiles(req, res);

      // Assert：验证返回 500 错误
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch files",
      });
    });
  });

  // ============ 场景 3：异常流程联动校验 ============
  describe("Scenario 3: Exception Flow Cross-Controller Validation", () => {
    test("Registered user cannot perform file operations without login token", async () => {
      // 场景：注册后直接上传文件，没有登录令牌

      // Arrange：设置无令牌的请求
      req.user = null; // 未认证
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

      // Act：执行上传
      await fileController.uploadFile(req, res);

      // Assert：验证上传失败
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      // 验证失败时清理上传的文件
      expect(fs.unlink).toHaveBeenCalled();
    });

    test("After user deletion, file download should fail (user record deleted but token may still exist)", async () => {
      // 场景：用户在数据库中被删除，使用原有令牌尝试下载文件

      // Arrange：模拟用户已被删除
      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "1" };

      // getUserProfile 返回 null（用户已被删除）
      authModel.getUserProfile.mockResolvedValue(null);

      // Act：尝试下载文件
      await fileController.downloadFile(req, res);

      // Assert：验证返回 500 或权限错误
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("Database insert failure during file upload triggers file cleanup and error response", async () => {
      // 场景：上传文件时数据库插入失败，本地文件应被删除

      // Arrange：设置上传请求
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

      // 模拟数据库插入失败
      fileModel.createFileRecord.mockRejectedValue(
        new Error("Database error")
      );

      // Mock fs.unlink 的回调
      fs.unlink.mockImplementation((path, callback) => {
        callback(null); // 模拟文件删除成功
      });

      // Act：执行上传
      await fileController.uploadFile(req, res);

      // Assert：验证返回 500 错误
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to upload file",
      });

      // 验证本地文件被删除
      expect(fs.unlink).toHaveBeenCalledWith(
        "uploads/test.pdf",
        expect.any(Function)
      );
    });

    test("File upload missing file triggers 400 error before database operation", async () => {
      // 场景：上传请求缺少文件，应在数据库操作前被拦截

      // Arrange：设置无文件的请求
      req.user = { id: mockUsers.userA.authId };
      req.file = null;

      // Act：执行上传
      await fileController.uploadFile(req, res);

      // Assert：验证返回 400 错误
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "No file uploaded",
      });

      // 验证未调用数据库操作
      expect(fileModel.createFileRecord).not.toHaveBeenCalled();

      // 验证未尝试删除文件
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    test("File download with missing file on disk returns 404", async () => {
      // 场景：文件记录存在数据库中，但物理文件不存在

      // Arrange：设置下载请求
      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      fileModel.getFileById.mockResolvedValue(mockFiles.fileA);

      // 模拟文件不存在于磁盘
      fs.existsSync.mockReturnValue(false);

      // Act：执行下载
      await fileController.downloadFile(req, res);

      // Assert：验证返回 404 错误
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found on server",
      });

      // 验证未尝试下载
      expect(res.download).not.toHaveBeenCalled();
    });

    test("File not found in database returns 404 before permission check", async () => {
      // 场景：请求的文件 ID 不存在数据库中

      // Arrange：设置下载请求
      req.user = { id: mockUsers.userA.authId };
      req.params = { id: "999" }; // 不存在的 ID

      authModel.getUserProfile.mockResolvedValue({
        userid: mockUsers.userA.userid,
      });

      // 文件不存在
      fileModel.getFileById.mockResolvedValue(null);

      // Act：执行下载
      await fileController.downloadFile(req, res);

      // Assert：验证返回 404 错误
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "File not found",
      });
    });

    test("Registration validation catches missing fields before database operation", async () => {
      // 场景：注册请求缺少必需字段

      // Test 1: 缺少 email
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

      // Test 2: 密码过短
      req.body = {
        email: "test@example.com",
        password: "12345", // 只有 5 个字符
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
      // 场景：登录请求缺少邮箱或密码

      req.body = {
        password: "password123",
        // 缺少 email
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
      expect(authModel.loginUser).not.toHaveBeenCalled();
    });

    test("Invalid credentials during login returns 401 without exposing system details", async () => {
      // 场景：登录凭证错误

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

  // ============ 场景 4：数据一致性校验 ============
  describe("Scenario 4: Data Consistency Across Controllers", () => {
    test("getUserProfile returns consistent data across auth and file operations", async () => {
      // 场景：验证同一用户的 getUserProfile 在不同操作中返回一致数据

      const expectedProfile = {
        userid: mockUsers.userA.userid,
        email: mockUsers.userA.email,
        username: mockUsers.userA.username,
        role: "user",
      };

      req.user = { id: mockUsers.userA.authId };

      // 第 1 次调用：在登录流程中
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

      // 第 2 次调用：在文件操作中
      authModel.getUserProfile.mockResolvedValue(expectedProfile);

      req.params = {};
      fileModel.getUserFiles.mockResolvedValue([]);

      await fileController.getUserFiles(req, res);

      // 验证两个操作使用相同的 userid
      expect(fileModel.getUserFiles).toHaveBeenCalledWith(expectedProfile.userid);
    });

    test("File ownership validation uses consistent user ID across operations", async () => {
      // 场景：验证文件所有权校验在上传、下载、删除中一致使用 userid

      req.user = { id: mockUsers.userA.authId };

      const userProfile = { userid: mockUsers.userA.userid };

      // ============ 上传时记录 userid ============
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

      // ============ 下载时验证 userid 一致性 ============
      req.params = { id: "1" };
      authModel.getUserProfile.mockResolvedValue(userProfile);
      fileModel.getFileById.mockResolvedValue({
        ...mockFiles.fileA,
        userid: userProfile.userid,
      });
      fs.existsSync.mockReturnValue(true);

      await fileController.downloadFile(req, res);

      expect(fileModel.getFileById).toHaveBeenCalledWith(1);
      // 验证文件所有者 ID 与当前用户匹配
      expect(res.download).toHaveBeenCalled();

      jest.clearAllMocks();

      // ============ 删除时验证 userid 一致性 ============
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
      // 场景：验证从登录到登出的整个会话周期内用户 ID 保持一致

      const sessionData = {
        authUserId: mockUsers.userA.authId,
        userid: mockUsers.userA.userid,
        token: mockUsers.userA.accessToken,
      };

      // 登录
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

      // 模拟用户会话状态
      req.user = { id: sessionData.authUserId };

      jest.clearAllMocks();

      // 文件操作 1：上传
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

      // 文件操作 2：列表
      authModel.getUserProfile.mockResolvedValue({
        userid: sessionData.userid,
      });
      fileModel.getUserFiles.mockResolvedValue([mockFiles.fileA]);

      await fileController.getUserFiles(req, res);

      expect(fileModel.getUserFiles).toHaveBeenCalledWith(sessionData.userid);

      jest.clearAllMocks();

      // 登出
      authModel.logoutUser.mockResolvedValue({ error: null });

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });

  // ============ 场景 5：错误处理与状态码校验 ============
  describe("Scenario 5: Error Handling and Status Codes", () => {
    test("All auth operations use correct HTTP status codes", async () => {
      // 场景：验证认证操作返回正确的 HTTP 状态码

      // 注册成功：201
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

      // 注册验证失败：400
      req.body = { password: "password123" };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      jest.clearAllMocks();

      // 登录成功：200（默认）
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

      // 登录成功不显式调用 status()，直接返回 200
      expect(res.json).toHaveBeenCalled();

      jest.clearAllMocks();

      // 登录失败：401
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
      // 场景：验证文件操作返回正确的 HTTP 状态码

      req.user = { id: "test-user-id" };

      // 上传成功：201
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

      // 上传无文件：400
      req.file = null;

      await fileController.uploadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      jest.clearAllMocks();

      // 文件不存在：404
      req.params = { id: "999" };

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getFileById.mockResolvedValue(null);

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);

      jest.clearAllMocks();

      // 权限拒绝：403
      req.params = { id: "1" };

      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getFileById.mockResolvedValue({
        fileid: 1,
        userid: 2, // 不同用户
      });

      await fileController.downloadFile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);

      jest.clearAllMocks();

      // 获取文件列表成功：200（默认）
      authModel.getUserProfile.mockResolvedValue({ userid: 1 });
      fileModel.getUserFiles.mockResolvedValue([]);

      await fileController.getUserFiles(req, res);

      expect(res.json).toHaveBeenCalledWith({ files: [] });
    });
  });
});
