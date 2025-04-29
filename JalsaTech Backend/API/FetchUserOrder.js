const { ObjectId } = require('mongodb');
const ConnectDB = require('../DB/db_connect');

async function fetchOrderHistory(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Orders");
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required", success: false });
        }

        // Convert userId to ObjectId if needed
        const userObjectId = ObjectId.isValid(userId) 
            ? ObjectId.createFromHexString(userId) 
            : userId;

        const orders = await collection.find({ userId: userObjectId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .toArray();

        if (!orders || orders.length === 0) {
            return res.status(200).json({ 
                message: "No orders found for this user", 
                data: [], 
                success: true 
            });
        }

        // Format the orders with order numbers
        const formattedOrders = orders.map(order => ({
            ...order,
            orderNumber: `#ORD-${order._id.toString().slice(-6).toUpperCase()}`
        }));

        return res.status(200).json({ 
            message: "Orders fetched successfully", 
            data: formattedOrders, 
            success: true 
        });

    } catch (error) {
        console.error("Order history fetch error:", error);
        return res.status(500).json({ 
            message: error.message, 
            success: false 
        });
    }
}

async function fetchSingleOrder(req, res) {
    try {
        const db = await ConnectDB();
        const collection = db.collection("Orders");
        const { orderId, userId } = req.params;

        if (!orderId || !userId) {
            return res.status(400).json({ 
                message: "Both order ID and user ID are required", 
                success: false 
            });
        }

        const orderObjectId = ObjectId.isValid(orderId) 
            ? ObjectId.createFromHexString(orderId) 
            : orderId;

        const userObjectId = ObjectId.isValid(userId) 
            ? ObjectId.createFromHexString(userId) 
            : userId;

        const order = await collection.findOne({ 
            _id: orderObjectId, 
            userId: userObjectId 
        });

        if (!order) {
            return res.status(404).json({ 
                message: "Order not found", 
                success: false 
            });
        }

        // Add order number to the response
        const formattedOrder = {
            ...order,
            orderNumber: `#ORD-${order._id.toString().slice(-6).toUpperCase()}`
        };

        return res.status(200).json({ 
            message: "Order fetched successfully", 
            data: formattedOrder, 
            success: true 
        });

    } catch (error) {
        console.error("Single order fetch error:", error);
        return res.status(500).json({ 
            message: error.message, 
            success: false 
        });
    }
}

module.exports = { fetchOrderHistory, fetchSingleOrder };