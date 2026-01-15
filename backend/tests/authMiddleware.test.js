const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const authModel = require("../models/authModel");

//mock authModel
jest.mock("../models/authModel");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    test("should authenticate valid token", async () => {
      //arrange
      req.headers["authorization"] = "Bearer valid-token";

      const mockUser = {
        id: "test-user-id",
        email: "test@example.com",
      };

      //mock verifyToken to return user
      authModel.verifyToken.mockResolvedValue({
        user: mockUser,
        error: null,
      });

      //act
      await authenticateToken(req, res, next);

      //assert
      expect(authModel.verifyToken).toHaveBeenCalledWith("valid-token");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 401 if no token provided", async () => {
      //arrange
      req.headers["authorization"] = undefined;

      //act
      await authenticateToken(req, res, next);

      //assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access token required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 403 if token is invalid", async () => {
      //arrange
      req.headers["authorization"] = "Bearer invalid-token";

      //mock verifyToken to return error
      authModel.verifyToken.mockResolvedValue({
        user: null,
        error: { message: "Invalid token" },
      });

      //act
      await authenticateToken(req, res, next);

      //assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle missing Bearer prefix", async () => {
      //arrange
      req.headers["authorization"] = "invalid-format";

      //act
      await authenticateToken(req, res, next);

      //assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    test("should allow admin user", async () => {
      //arrange
      req.user = { id: "admin-user-id" };

      const mockUserProfile = {
        userid: 1,
        role: "admin",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await isAdmin(req, res, next);

      //assert
      expect(authModel.getUserProfile).toHaveBeenCalledWith("admin-user-id");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 403 if user is not admin", async () => {
      //arrange
      req.user = { id: "regular-user-id" };

      const mockUserProfile = {
        userid: 2,
        role: "user",
      };

      authModel.getUserProfile.mockResolvedValue(mockUserProfile);

      //act
      await isAdmin(req, res, next);

      //assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Admin access required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle error when checking admin status", async () => {
      //arrange
      req.user = { id: "test-user-id" };

      authModel.getUserProfile.mockRejectedValue(new Error("Database error"));

      //act
      await isAdmin(req, res, next);

      //assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
