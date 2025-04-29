const jwt = require("jsonwebtoken");
const ConnectMongoDB = require("../DB/db_connect");

const JWT_SECRET = "your_secret_key"; // Should match your login API's secret

async function UserRegisterApi(req, res) {
    try {
        const db = await ConnectMongoDB();
        const collection = db.collection("users");

        // Check if user already exists
        const existingUser = await collection.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Prepare user data (matches your frontend structure)
        const userData = {
            email: req.body.email,
            password: req.body.password, // Stored as plaintext (not recommended for production)
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            companyName: req.body.companyName,
            address: {
                street: req.body.address?.street || req.body.streetAddress,
                apartment: req.body.address?.apartment || req.body.apartment,
                city: req.body.address?.city || req.body.city,
                country: req.body.address?.country || req.body.country,
                postcode: req.body.address?.postcode || req.body.postcode
            },
            phone: req.body.phone,
            shippingAddress: req.body.shippingAddress,
            notes: req.body.notes,
            createdAt: new Date()
        };

        // Insert new user
        const result = await collection.insertOne(userData);
        const newUser = { ...userData, _id: result.insertedId };

        // Create JWT token (matches your login API format)
        const tokenPayload = { user: newUser };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            userData: tokenPayload
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed. Please try again.' 
        });
    }
}

module.exports = { UserRegisterApi };