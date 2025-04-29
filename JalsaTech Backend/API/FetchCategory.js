const ConnectDB = require('../DB/db_connect');
const { ObjectId } = require('mongodb');

async function FetchCategory(req, res) {
    try {
        const db = await ConnectDB();
        const categoriesCollection = db.collection("Categories");
        const productsCollection = db.collection("Products");

        // Fetch all categories
        const categories = await categoriesCollection.find({}).toArray();

        // For each category, count products in that category
        const enrichedCategories = await Promise.all(
            categories.map(async (cat) => {
                const count = await productsCollection.countDocuments({ category:  cat._id });
                return {
                    ...cat,
                    productCount: count
                };
            })
        );

        return res.status(200).json({ 
            message: "Categories fetched successfully with product counts", 
            data: enrichedCategories, 
            success: true 
        });

    } catch (error) {
        console.error("FetchCategory error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { FetchCategory };
