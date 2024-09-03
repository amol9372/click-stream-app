import express from "express";
import DB from "../db.js";
import { logger } from "../utils/logger.js";
import { publishKafkaMessage } from "../kafka.js";
import { CART_TOPIC, ORDERS_TOPIC } from "../utils/constants.js";

const router = express.Router();
const db = DB.getConnection();

export default router;

router.post("/create", async (req, res) => {
  const { cartId, shippingAddress } = req.body;

  // Input validation
  if (!cartId) {
    return res
      .status(400)
      .json({ error: "Cart ID and shipping address are required" });
  }

  try {
    // 1. Verify cart ownership and status
    const cart = await getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (cart.user_id !== req.user.userId) {
      // Assuming you have user authentication in place
      return res.status(403).json({ error: "Unauthorized access to cart" });
    }

    if (cart.status !== "CHECKOUT") {
      return res.status(400).json({ error: "Cart is not in checkout state" });
    }

    // 2. Calculate total amount from cart items
    const totalAmount = await calculateCartTotal(cartId);

    // 3. Create the order
    const orderResult = await createOrder(req.user.userId, cartId, totalAmount);
    const orderId = orderResult.lastID;

    // 4. Create the shipping entry
    await createShippingEntry(
      req.user.userId,
      orderId,
      JSON.stringify(req.user.address)
    );

    // 5. Update cart status
    await updateCartStatus(cartId, "ORDER_PLACED");

    // 6. Publish Kafka event
    const event = {
      key: req.user.userId,
      message: {
        type: "ORDER_CREATED",
        orderId: orderId,
        cartId: cartId,
        totalAmount: totalAmount,
      },
    };
    publishKafkaMessage(ORDERS_TOPIC, event).catch((err) => logger.error(err));

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
    });
  } catch (err) {
    logger.error(err.error || "An error occurred during order creation");
    res.status(err.status || 500).json({
      message: err.error || "An error occurred during order creation",
    });
  }
});

router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1. Verify order ownership (if applicable)
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to order" });
    }

    // 2. Fetch order items and their details
    const orderItems = await getOrderItems(order.cart_id);

    // 3. Prepare the response data
    const responseData = {
      orderId: orderId,
      items: orderItems.map((item) => ({
        name: item.Name,
        category: item.Category,
        cost: item.Cost,
        quantity: item.quantity,
      })),
      totalAmount: order.total_amount,
      // paymentMethod: ... (fetch from wherever you're storing it),
      // estimatedDeliveryDate: ... (fetch from the 'shipping' table)
    };

    res.status(200).json(responseData);
  } catch (err) {
    logger.error(err.error || "An error occurred while fetching order items");
    res.status(err.status || 500).json({
      message: err.error || "An error occurred while fetching order items",
    });
  }
});

// Helper functions
function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM orders WHERE ID = ?";
    db.get(query, [orderId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching order",
        });
      }
      resolve(row);
    });
  });
}

function getOrderItems(cartId) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT p.Name, p.Category, p.Cost, ci.quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.ID
        WHERE ci.cart_id = ?
      `;

    db.all(query, [cartId], (err, rows) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching order items",
        });
      }
      resolve(rows);
    });
  });
}

// Helper functions (implement based on your database interaction logic)
function getCartById(cartId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM cart WHERE ID = ?";
    db.get(query, [cartId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching cart",
        });
      }
      resolve(row); // Resolve with the entire cart row if found, or null if not
    });
  });
}

function calculateCartTotal(cartId) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT SUM(ci.quantity * p.Cost) as total 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.ID
        WHERE ci.cart_id = ?
      `;

    db.get(query, [cartId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while calculating cart total",
        });
      }
      resolve(row ? row.total : 0); // Resolve with the calculated total, or 0 if no items found
    });
  });
}

function createOrder(userId, cartId, totalAmount) {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO orders (user_id, cart_id, total_amount, status)
        VALUES (?, ?, ?, 'ORDER_PLACED')
      `;

    db.run(query, [userId, cartId, totalAmount], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: `"Database error while creating order ${err}"`,
        });
      }
      resolve(this); // Resolve with 'this' to access lastID
    });
  });
}

function createShippingEntry(userId, orderId, shippingAddress) {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO shipping (user_id, order_id, shipping_address, tracking_no)
        VALUES (?, ?, ?, ?)
      `;

    db.run(
      query,
      [userId, orderId, shippingAddress, generateRandomTrackingNumber()],
      function (err) {
        if (err) {
          return reject({
            status: 500,
            error: "Database error while creating shipping entry",
          });
        }
        resolve();
      }
    );
  });
}

function updateCartStatus(cartId, newStatus) {
  return new Promise((resolve, reject) => {
    const query = `
        UPDATE cart 
        SET status = ?, updated_date = CURRENT_TIMESTAMP 
        WHERE ID = ?
      `;

    db.run(query, [newStatus, cartId], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: `"Database error while updating cart status ${err}"`,
        });
      }
      resolve();
    });
  });
}

function generateRandomTrackingNumber() {
  const min = 1000000000;
  const max = 9999999999;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Generate a random 2-letter code
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const code =
    letters.charAt(Math.floor(Math.random() * letters.length)) +
    letters.charAt(Math.floor(Math.random() * letters.length));

  return code + randomNumber.toString();
}
