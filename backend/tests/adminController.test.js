const adminController = require("../controllers/adminController");
const adminModel = require("../models/adminModel");
const authModel = require("../models/authModel");

//mock the models
jest.mock("../models/adminModel");
jest.mock("../models/authModel");

describe("Admin Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: "admin-auth-id" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("getAllUsers", () => {
    test("should get all users successfully", async () => {
      //arrange
      const mockUsers = [
        {
          userid: 1,
          username: "user1",
          email: "user1@example.com",
          role: "user",
        },
        {
          userid: 2,
          username: "user2",
          email: "user2@example.com",
          role: "admin",
        },
      ];

      adminModel.getAllUsers.mockResolvedValue(mockUsers);

      //act
      await adminController.getAllUsers(req, res);

      //assert
      expect(adminModel.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test("should handle error when getting users", async () => {
      //arrange
      console.log('[TEST] Expected behavior: Throwing fake "Database error" to verify getAllUsers handles it correctly');
      adminModel.getAllUsers.mockRejectedValue(new Error("Database error"));

      //act
      await adminController.getAllUsers(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch users",
      });
    });
  });

  describe("createUser", () => {
    test("should create user successfully", async () => {
      //arrange
      req.body = {
        email: "newuser@example.com",
        password: "password123",
        username: "newuser",
        role: "user",
      };

      const mockAuthUser = { id: "new-auth-id" };
      const mockUserProfile = {
        userid: 3,
        email: "newuser@example.com",
        username: "newuser",
        role: "user",
      };

      authModel.registerUser.mockResolvedValue({
        authUser: mockAuthUser,
        error: null,
      });

      authModel.createUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await adminController.createUser(req, res);

      //assert
      expect(authModel.registerUser).toHaveBeenCalledWith(
        "newuser@example.com",
        "password123"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: {
          id: 3,
          email: "newuser@example.com",
          username: "newuser",
          role: "user",
        },
      });
    });

    test("should return 400 if username is missing", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      //act
      await adminController.createUser(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email, password, and username are required",
      });
    });

    test("should return 400 if password is too short", async () => {
      //arrange
      req.body = {
        email: "test@example.com",
        password: "12345",
        username: "testuser",
      };

      //act
      await adminController.createUser(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Password must be at least 6 characters",
      });
    });
  });

  describe("deleteUser", () => {
    test("should delete user successfully", async () => {
      //arrange
      req.params = { id: "5" };

      const mockUser = {
        userid: 5,
        authuserid: "user-to-delete-auth-id",
        username: "userToDelete",
      };

      const mockAdminProfile = {
        userid: 1,
        role: "admin",
      };

      adminModel.getUserById.mockResolvedValue(mockUser);
      authModel.getUserProfile.mockResolvedValue(mockAdminProfile);
      adminModel.deleteUserProfile.mockResolvedValue();
      adminModel.deleteAuthUser.mockResolvedValue();

      //act
      await adminController.deleteUser(req, res);

      //assert
      expect(adminModel.getUserById).toHaveBeenCalledWith(5);
      expect(adminModel.deleteUserProfile).toHaveBeenCalledWith(5);
      expect(adminModel.deleteAuthUser).toHaveBeenCalledWith(
        "user-to-delete-auth-id"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    test("should return 404 if user not found", async () => {
      //arrange
      req.params = { id: "999" };

      adminModel.getUserById.mockResolvedValue(null);

      //act
      await adminController.deleteUser(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    test("should return 400 if trying to delete own account", async () => {
      //arrange
      req.params = { id: "1" };

      const mockUser = {
        userid: 1,
        authuserid: "admin-auth-id",
        username: "admin",
      };

      const mockAdminProfile = {
        userid: 1,
        role: "admin",
      };

      adminModel.getUserById.mockResolvedValue(mockUser);
      authModel.getUserProfile.mockResolvedValue(mockAdminProfile);

      //act
      await adminController.deleteUser(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Cannot delete your own account",
      });
    });

    test("should return 400 if ID is invalid", async () => {
      //arrange
      req.params = { id: "invalid" };

      //act
      await adminController.deleteUser(req, res);

      //assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid user ID",
      });
    });
  });
});
