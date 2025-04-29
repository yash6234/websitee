const ConnectDB = require('../DB/db_connect');
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order
async function CreateOrder(req, res) {
    try {
        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");
        const productsCollection = db.collection("Products");
        
        const {
            userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderNotes,
            status
        } = req.body;

        // Validate required fields
        if (!userId || !items || !totalAmount || !shippingAddress) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false
            });
        }

        // Create order document
        const orderData = {
            userId: new ObjectId(userId),
            items: items.map(item => ({
                productId: new ObjectId(item.productId),
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderNotes,
            status: status || 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Handle based on payment method
        if (paymentMethod === 'razorpay') {
            // Create Razorpay order
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Convert to paise
                currency: 'INR',
                receipt: `order_${Date.now()}`,
                payment_capture: 1
            });
            
            // Add Razorpay order ID to our order
            orderData.razorpayOrderId = razorpayOrder.id;
        }

        // Insert order into database
        const result = await ordersCollection.insertOne(orderData);

        // Update product inventory
        for (const item of items) {
            await productsCollection.updateOne(
                { _id: new ObjectId(item.productId) },
                { $inc: { stock: -item.quantity } }
            );
        }

        // Prepare response based on payment method
        if (paymentMethod === 'razorpay') {
            return res.status(200).json({
                message: "Order created successfully with Razorpay",
                orderId: result.insertedId,
                razorpayOrderId: orderData.razorpayOrderId,
                success: true
            });
        } else {
            // COD or other payment methods
            return res.status(200).json({
                message: "Order created successfully",
                orderId: result.insertedId,
                success: true
            });
        }

    } catch (error) {
        console.error("CreateOrder error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

// Verify Razorpay Payment
async function VerifyPayment(req, res) {
    try {
        const {
            orderId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature
        } = req.body;

        // Validate required fields
        if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
            return res.status(400).json({
                message: "Missing required fields for payment verification",
                success: false
            });
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({
                message: "Invalid payment signature",
                success: false
            });
        }

        // Update order status in database
        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");

        await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            {
                $set: {
                    status: 'paid',
                    razorpayPaymentId,
                    updatedAt: new Date()
                }
            }
        );

        return res.status(200).json({
            message: "Payment verified successfully",
            success: true
        });

    } catch (error) {
        console.error("VerifyPayment error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

// Get Orders by User ID
async function GetOrdersByUser(req, res) {
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");

        const orders = await ordersCollection
            .find({ userId: new ObjectId(userId) })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json({
            message: "Orders fetched successfully",
            data: orders,
            success: true
        });

    } catch (error) {
        console.error("GetOrdersByUser error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

// Get Single Order Details
async function GetOrderDetails(req, res) {
    try {
        const orderId = req.params.orderId;
        
        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
                success: false
            });
        }

        const db = await ConnectDB();
        const ordersCollection = db.collection("Orders");
        const productsCollection = db.collection("Products");

        // Get the order
        const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                success: false
            });
        }

        // Populate product details
        const enrichedItems = await Promise.all(
            order.items.map(async (item) => {
                const product = await productsCollection.findOne({ _id: item.productId });
                return {
                    ...item,
                    product: product ? {
                        _id: product._id,
                        title: product.title,
                        images: product.images
                    } : null
                };
            })
        );

        order.items = enrichedItems;

        return res.status(200).json({
            message: "Order details fetched successfully",
            data: order,
            success: true
        });

    } catch (error) {
        console.error("GetOrderDetails error:", error);
        return res.status(500).json({ 
            message: error.message,
            success: false
        });
    }
}

module.exports = { 
    CreateOrder,
    VerifyPayment,
    GetOrdersByUser,
    GetOrderDetails
};