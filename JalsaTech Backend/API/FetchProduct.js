const ConnectDB = require('../DB/db_connect');

async function Fetchproduct(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Products");

        const data = await collection.find({}).toArray();
        
        return res.status(200).json({ message: "products fetched successfully"  , data,success:true}); 
    } catch (error) {
        console.error("Bulk insert error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { Fetchproduct };