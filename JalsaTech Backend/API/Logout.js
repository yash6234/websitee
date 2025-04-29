const ConnectMongoDB = require("../DB/db_connect");
const jwt = require("jsonwebtoken");

async function UserLogoutApi(req, res) {
    try {
        const db = await ConnectMongoDB();
        const tokenBlacklist = db.collection("tokenBlacklist");
        
        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // Add token to blacklist with expiration time
            const decoded = jwt.decode(token);
            await tokenBlacklist.insertOne({
                token,
                expiresAt: new Date(decoded.exp * 1000) // Convert JWT exp to Date
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Logout successful - token invalidated"
        });
    } catch (error) {
        console.log("logout.js error: ", error);
        res.status(500).json({ 
            success: false, 
            error: "Logout Failed" 
        });
    }
}


module.exports={UserLogoutApi};