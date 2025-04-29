const { ObjectId } = require('mongodb');
const ConnectDB = require('../DB/db_connect');

async function FetchProductById(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Products");
        const { productId } = req.params;

        console.log("productId", productId);

        const product = await collection.findOne({ _id: ObjectId.createFromHexString(productId) });

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        return res.status(200).json({ message: "Product fetched successfully", data: product, success: true });
    } catch (error) {
        console.error("Fetch product by ID error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { FetchProductById };