const { ObjectId } = require('mongodb');
const ConnectDB = require('../DB/db_connect');

async function AddProduct(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Products");

        // Expecting an array of product objects
        const products = req.body;

        // Convert category string to ObjectId
        const productsToInsert = products.map(product => ({
            ...product,
            category: ObjectId.createFromHexString(product.category),
            ratings: { average: 0, count: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await collection.insertMany(productsToInsert);

        return res.status(200).json({ message: `${products.length} Products Added` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {AddProduct};