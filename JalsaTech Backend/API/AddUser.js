const ConnectDB = require('../DB/db_connect');

async function AddUser(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Users");

        const { name, email, password, role, address, wishlist } = req.body;

        await collection.insertOne({
            name,
            email,
            password,
            role: role || "customer",
            address: address || [],
            wishlist: wishlist || [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return res.status(200).json({ message: "User Added" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}


module.exports = { AddUser };