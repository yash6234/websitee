const { ObjectId } = require('mongodb');
const ConnectDB = require('../DB/db_connect');

async function FetchproductCatwise(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Products");
        const {catId} = req.params;
        console.log("catId",catId);
        console.log("p",req.params.catId);
        
        const data = await collection.find({category: ObjectId.createFromHexString(catId)}).toArray();
        
        return res.status(200).json({ message: "products fetched successfully"  , data,success:true}); 
    } catch (error) {
        console.error("Bulk insert error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { FetchproductCatwise };