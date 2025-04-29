const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key";

function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid Token" });

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
