const authController = require("../controllers/authController");
const authModel = require("../models/authModel");

//mock the authmodel
jest.mock("../models/authModel");

describe("Auth Controller", () => {
  let req, res;

  //setup before each test
  beforeEach(() => {
    //mock request object
    req = {
      body: {},
      user: { id: "test-user-id" },
    };

    //mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    //clear all mocks
    jest.clearAllMocks();
  });

  describe("register", () => {
    test("should register user successfully", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        role: "user",
      };

      const mockAuthUser = { id: "auth-user-id" };
      const mockUserProfile = {
        userid: 1,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      };

      authModel.registerUser.mockResolvedValue({
        authUser: mockAuthUser,
        error: null,
      });

      authModel.createUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await authController.register(req, res);

      //assert
      expect(authModel.registerUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(authModel.createUserProfile).toHaveBeenCalledWith(
        "auth-user-id",
        "test@example.com",
        "testuser",
        "user"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: {
          id: 1,
          email: "test@example.com",
          username: "testuser",
          role: "user",
        },
      });
    });

    test("should return 400 if email is missing", async () => {
      //arrange
      req.body = {
        password: "password123",
        username: "testuser",
      };

      //act
      await authController.register(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email, password, and username are required",
      });
      expect(authModel.registerUser).not.toHaveBeenCalled();
    });

    test("should return 400 if password is too short", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "12345", //only 5 characters
        username: "testuser",
      };

      //act
      await authController.register(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Password must be at least 6 characters",
      });
    });

    test("should return 400 if registration fails", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      };

      authModel.registerUser.mockResolvedValue({
        authUser: null,
        error: { message: "Email already registered" },
      });

      //act
      await authController.register(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email already registered",
      });
    });
  });

  describe("login", () => {
    test("should login user successfully", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const mockSession = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      };

      const mockUser = { id: "auth-user-id" };

      const mockUserProfile = {
        userid: 1,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      };

      authModel.loginUser.mockResolvedValue({
        session: mockSession,
        user: mockUser,
        error: null,
      });

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await authController.login(req, res);

      //assert
      expect(authModel.loginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        user: {
          id: 1,
          email: "test@example.com",
          username: "testuser",
          role: "user",
        },
      });
    });

    test("should return 400 if email is missing", async () => {
      //arrange
      req.body = {
        password: "password123",
      };

      //act
      await authController.login(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
    });

    test("should return 401 if credentials are invalid", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      authModel.loginUser.mockResolvedValue({
        session: null,
        user: null,
        error: { message: "Invalid credentials" },
      });

      //act
      await authController.login(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });

  describe("logout", () => {
    test("should logout successfully", async () => {
      //arrange
      authModel.logoutUser.mockResolvedValue({ error: null });

      //act
      await authController.logout(req, res);

      //assert
      expect(authModel.logoutUser).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });

    test("should handle logout error", async () => {
      //arrange
      authModel.logoutUser.mockResolvedValue({
        error: { message: "Logout failed" },
      });

      //act
      await authController.logout(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Logout failed",
      });
    });
  });

  describe("getProfile", () => {
    test("should get user profile successfully", async () => {
      //arrange
      const mockUserProfile = {
        userid: 1,
        email: "test@example.com",
        username: "testuser",
        role: "user",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await authController.getProfile(req, res);

      //assert
      expect(authModel.getUserProfile).toHaveBeenCalledWith("test-user-id");
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 1,
          email: "test@example.com",
          username: "testuser",
          role: "user",
        },
      });
    });

    test("should handle error when getting profile", async () => {
      //arrange
      console.log('[TEST] Expected behavior: Throwing fake "Database error" to verify getProfile handles it correctly');
      authModel.getUserProfile.mockRejectedValue(new Error("Database error"));

      //act
      await authController.getProfile(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
