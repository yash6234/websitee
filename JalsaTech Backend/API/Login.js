
const jwt = require("jsonwebtoken");
const ConnectMongoDB = require("../DB/db_connect");

const JWT_SECRET = "your_secret_key"; 

async function UserLoginApi(req, res) {
    try {
        const db = await ConnectMongoDB();
        const collection = db.collection("users");

        const { email, password } = req.body;
        const user = await collection.findOne({ email, password });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid username or password" });
        }

        // Create JWT token
        const tokenPayload = { user  };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "10h" });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            userData: tokenPayload
        });
    } catch (error) {
        console.log("login.js error: ", error);
        res.status(500).json({ success: false, error: "Login Failed" });
    }
}

module.exports = { UserLoginApi };
