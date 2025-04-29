const ConnectDB = require('../DB/db_connect');
const { ObjectId } = require('mongodb');
require('dotenv').config();

// Create COD Order
async function CreateCODOrder(req, res) {
    try {
        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");
        const productsCollection = db.collection("Products");
        
        const {
            userId,
            items,
            totalAmount,
            shippingAddress,
            orderNotes
        } = req.body;

        // Validate required fields
        if (!userId || !items || !totalAmount || !shippingAddress) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false
            });
        }

        // Create order document for COD
        const orderData = {
            userId: new ObjectId(userId),
            items: items.map(item => ({
                productId: new ObjectId(item.productId),
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            shippingAddress,
            paymentMethod: 'cod',
            orderNotes,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert order into database
        const result = await ordersCollection.insertOne(orderData);

        // Update product inventory
        for (const item of items) {
            await productsCollection.updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { stock: -item.quantity } }
            );
        }

        return res.status(200).json({
            message: "COD order created successfully",
            orderId: result.insertedId,
            success: true
        });

    } catch (error) {
        console.error("CreateCODOrder error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

// Update COD Order Status (for admin use - to mark as delivered/paid)
async function UpdateCODOrderStatus(req, res) {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({
                message: "Order ID and status are required",
                success: false
            });
        }

        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");

        const result = await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            { 
                $set: { 
                    status: status,
                    updatedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Order not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            success: true
        });

    } catch (error) {
        console.error("UpdateCODOrderStatus error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

module.exports = { 
    CreateCODOrder,
    UpdateCODOrderStatus
};