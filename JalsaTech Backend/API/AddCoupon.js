const ConnectDB = require('../DB/db_connect');

async function AddCoupon(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Coupons");

        const { code, description, discountType, discountValue, minOrderAmount, validTill } = req.body;

        await collection.insertOne({
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            validTill: new Date(validTill),
            isActive: true,
            usedBy: []
        });

        return res.status(200).json({ message: "Coupon Created" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}



module.exports = { AddCoupon };