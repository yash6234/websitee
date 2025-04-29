const express = require('express');
const cors = require('cors');
const { AddUser } = require('./API/AddUser');
const { AddProduct } = require('./API/AddProduct');
const { AddCoupon } = require('./API/AddCoupon');
const { AddCategory } = require('./API/AddCategory');
const { Fetchproduct } = require('./API/FetchProduct');
const { FetchCategory } = require('./API/FetchCategory');
const { FetchproductCatwise } = require('./API/FetchProductCategorywise');
const { RenameCategoryField } = require('./API/renamecat');
const { FetchProductById } = require('./API/FetchProductByID');
const { UserLoginApi } = require('./API/Login');
const { UserRegisterApi } = require('./API/Register');
const { UserLogoutApi } = require('./API/Logout');
const authenticateToken = require('./auth/auth');
const { CreateOrder, VerifyPayment, GetOrdersByUser, GetOrderDetails } = require('./API/placeorder');
const { CreateCODOrder, UpdateCODOrderStatus } = require('./API/CODOrder');
const { fetchOrderHistory, fetchSingleOrder } = require('./API/FetchUserOrder');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const port = 8100;

const allowedOrigins = [
  "http://localhost:3000",
  "http://jalsatech.s3-website.ap-south-1.amazonaws.com"
];


app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.post("/logout", UserLogoutApi);
app.post("/login", UserLoginApi);
app.post("/register", UserRegisterApi);
app.post("/adduser", AddUser);
app.post("/addproduct", AddProduct);
app.post("/addcoupon", AddCoupon);
app.post("/addcategory", AddCategory);

app.get('/allprodutcs', Fetchproduct);
app.get('/allcategory', FetchCategory);
app.get('/products/:catId', FetchproductCatwise);
app.get('/productsid/:productId', FetchProductById);

app.post('/create', authenticateToken, CreateOrder);

// Verify Razorpay payment
app.post('/verify-payment', authenticateToken, VerifyPayment);

// Get orders by user
app.get('/user/:userId', authenticateToken, GetOrdersByUser);

// Get single order details
app.get('/:orderId', authenticateToken, GetOrderDetails);
// app.get('/rm', RenameCategoryField)

app.post('/create-cod-order', authenticateToken, CreateCODOrder);
app.post('/update-cod-status', authenticateToken, UpdateCODOrderStatus);
app.get('/history/:userId', fetchOrderHistory);
app.get('/:orderId/:userId', fetchSingleOrder);
app.listen(
  port, () => {
    console.log("Server started on port", port)
  }
)