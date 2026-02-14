const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authController = require("./controllers/authController");
const { authenticateToken } = require("./middleware/authMiddleware");
const fileRoutes = require("./routes/fileRoutes");
const adminRoutes = require("./routes/adminRoutes");
// const adminController = require("./controllers/adminController");

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is working");
});

//routes
app.post("/register", authController.register);
app.post("/login", authController.login);

app.post("/logout", authenticateToken, authController.logout);
app.get("/profile", authenticateToken, authController.getProfile);

//file routes
app.use("/dashboard", fileRoutes);
app.use("/admin", adminRoutes);

//start server only if not being imported (for tests)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
