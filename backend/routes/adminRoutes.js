const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

//all routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

router.get("/", adminController.getAllUsers);

router.post("/create_user", adminController.createUser);

router.post("/delete_user/:id", adminController.deleteUser);

module.exports = router;
