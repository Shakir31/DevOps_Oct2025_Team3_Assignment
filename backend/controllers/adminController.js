const adminModel = require("../models/adminModel");
const authModel = require("../models/authModel");

//get all users (admin dashboard)
async function getAllUsers(req, res) {
  try {
    const users = await adminModel.getAllUsers();

    res.json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

//create new user
async function createUser(req, res) {
  try {
    const { email, password, username, role } = req.body;

    //validation
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    console.log("Admin creating user:", { email, username, role });

    //register with Supabase Auth
    const { authUser, error: authError } = await authModel.registerUser(
      email,
      password
    );

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(400).json({
        error: authError.message || "Failed to create user",
      });
    }

    console.log("Auth user created:", authUser.id);

    //create user profile in database
    try {
      const userProfile = await authModel.createUserProfile(
        authUser.id,
        email,
        username,
        role || "user"
      );

      console.log("User profile created:", userProfile);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: userProfile.userid,
          email: userProfile.email,
          username: userProfile.username,
          role: userProfile.role,
        },
      });
    } catch (profileError) {
      console.error("Profile creation error:", profileError);
      return res.status(500).json({
        error: "Failed to create user profile",
      });
    }
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//delete user
async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    console.log("Admin deleting user:", userId);

    //get user to find their auth user ID
    const user = await adminModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //dont allow admin to delete themselves
    const adminProfile = await authModel.getUserProfile(req.user.id);
    if (adminProfile.userid === userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    try {
      await adminModel.deleteAuthUser(user.authuserid);
      console.log("Auth user deleted successfully");
    } catch (authError) {
      console.error("Auth deletion error:", authError);
      return res.status(500).json({
        error: "Failed to delete user from authentication system",
      });
    }

    //delete user profile from database (files will cascade delete)
    await adminModel.deleteUserProfile(userId);
    console.log("User profile deleted successfully");

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
};
