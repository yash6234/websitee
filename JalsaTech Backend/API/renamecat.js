const { ObjectId } = require('mongodb');
const ConnectDB = require('../DB/db_connect');

async function RenameCategoryField(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Products");

        // Rename category field to cat
        const result = await collection.updateMany(
            {},
            { $rename: { "category": "cat" } }
        );

        return res.status(200).json({ 
            message: "Category field renamed successfully", 
            result, 
            success: true 
        });
    } catch (error) {
        console.error("Rename error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { RenameCategoryField };
