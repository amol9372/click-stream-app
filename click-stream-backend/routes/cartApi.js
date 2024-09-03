import express from "express";
import DB from "../db.js";
import { logger } from "../utils/logger.js";
import { publishKafkaMessage } from "../kafka.js";
import { CART_TOPIC } from "../utils/constants.js";

const router = express.Router();

const db = DB.getConnection();

router.post("/add", async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    if (!productId || !quantity) {
      logger.error("product and quantity are required");
      return res
        .status(400)
        .json({ error: "product and quantity are required" });
    }

    const user = await getUser(req.user.userId);
    logger.info(user);

    if (!user) {
      logger.error("invalid user", req.user.userId);
      return res.status(401).json({ error: "Invalid user" });
    }

    // Step 1: Check if the user has an active cart
    let cartId = await getActiveCart(user.ID);

    logger.info(cartId);

    // Step 2: If no active cart exists, create one
    if (!cartId) {
      cartId = await createCart(user.ID);
      logger.info(cartId);
    }

    // Step 3: Add the product to the cart items

    await addItemToCart(cartId, productId, quantity);
    logger.info("Product added to cart successfully", cartId);

    const event = {
      key: user.ID,
      message: { type: "ITEM_ADDED", productId: productId, cartId: cartId },
    };

    publishKafkaMessage(CART_TOPIC, event).catch((err) => logger.error(err));

    res
      .status(201)
      .json({ message: "Product added to cart successfully", cartId: cartId });
  } catch (err) {
    logger.error(err.error || "An error occurred");
    res
      .status(err.status || 500)
      .json({ message: err.error || "An error occurred" });
  }
});

router.delete("/delete/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  try {
    await deleteCartItem(cartItemId);
    logger.info("Item removed from cart successfully", cartItemId);

    const event = {
      key: req.user.userId,
      message: { type: "ITEM_DELETED", cartItemId: cartItemId },
    };

    publishKafkaMessage(CART_TOPIC, event).catch((err) => logger.error(err));

    res.status(204).json({ message: "Item removed from cart successfully" });
  } catch (err) {
    logger.error(err.error || "An error occurred");
    res
      .status(err.status || 500)
      .json({ message: err.error || "An error occurred" });
  }
});

router.post("/checkout/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    // 1. Verify the cart exists and belongs to the user
    const cartExists = await checkCartOwnership(cartId, req.user.userId);
    if (!cartExists) {
      const event = {
        key: req.user.userId,
        message: {
          type: "ERROR",
          cartId: cartId,
          errorDetail: "Cart not found or unauthorized access",
        },
      };
      publishKafkaMessage(CART_TOPIC, event).catch((err) => logger.error(err));

      return res
        .status(404)
        .json({ error: "Cart not found or unauthorized access" });
    }

    // 2. Update the cart status to 'CHECKOUT'
    await updateCartStatus(cartId, "CHECKOUT");
    // 3. (Optional) Create an order record in your 'orders' table, linking it to the cartId

    // 4. Publish a Kafka event
    const event = {
      key: req.user.userId,
      message: { type: "CHECKOUT", cartId: cartId },
    };
    publishKafkaMessage(CART_TOPIC, event).catch((err) => logger.error(err));

    res.status(200).json({ message: "Checkout initiated successfully" });
  } catch (err) {
    logger.error(err.error || "An error occurred during checkout");
    res
      .status(err.status || 500)
      .json({ message: err.error || "An error occurred during checkout" });
  }
});

router.get("/", async (req, res) => {
  try {
    const cart = await getActiveCart(req.user.userId);

    if (!cart) {
      logger.error(`"No active cart exists for userId ::: ${req.user.userId}"`);
      return res.status(422).json({
        error: `"No active cart exists for userId ::: ${req.user.userId}"`,
      });
    }

    const cartItems = await getCartItems(cart);

    const responseData = {
      cartId: cart.ID,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.Name,
        category: item.Category,
        cost: item.Cost,
        quantity: item.quantity,
      })),
      totalAmount: cartItems.reduce((accumulator, item) => {
        return accumulator + item.Cost * item.quantity;
      }, 0),
    };

    res.status(200).json(responseData);
  } catch (err) {
    logger.error(err.error || "An error occurred while fetching order items");
    res.status(err.status || 500).json({
      message: err.error || "An error occurred while fetching order items",
    });
  }
});

function getCartItems(cartId) {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT ci.ID, p.Name, p.Category, p.Cost, ci.quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.ID
        WHERE ci.cart_id = ?
      `;

    db.all(query, [cartId], (err, rows) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching cart items",
        });
      }
      resolve(rows);
    });
  });
}

// Helper functions
function checkCartOwnership(cartId, userId) {
  return new Promise((resolve, reject) => {
    const query =
      'SELECT ID FROM cart WHERE ID = ? AND user_id = ? AND status = "ACTIVE"';
    db.get(query, [cartId, userId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while verifying cart ownership",
        });
      }
      resolve(row ? true : false);
    });
  });
}

function updateCartStatus(cartId, newStatus) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE cart SET status = ? WHERE ID = ?";
    db.run(query, [newStatus, cartId], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while updating cart status",
        });
      }
      resolve();
    });
  });
}

// Function to check if an active cart exists for the user
function getActiveCart(userId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT ID FROM cart WHERE user_id = ? AND status = "ACTIVE"';
    db.get(query, [userId], (err, row) => {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while fetching cart",
        });
      }
      resolve(row ? row.ID : null);
    });
  });
}

// delete cart item
function deleteCartItem(cartItemId) {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM CART_ITEMS WHERE ID = ?";
    db.run(query, [cartItemId], function (err) {
      if (err) {
        logger.error("Database error while removing cart item", err);
        return reject({
          status: 500,
          error: "Database error while removing cart item",
        });
      }
      if (this.changes === 0) {
        // No rows were deleted, meaning the cartItemId did not exist
        logger.warn("No cart item found with the provided ID");
        return reject({
          status: 404,
          error: "No cart item found with the provided ID",
        });
      }
      resolve();
    });
  });
}

// Function to create a new cart for the user
function createCart(userId) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO cart (user_id, status) VALUES (?, 'ACTIVE');`;
    db.run(query, [userId], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: `"Database error while creating cart ${err}"`,
        });
      }
      resolve(this.lastID); // Return the ID of the newly created cart
    });
  });
}

// Function to add an item to the cart
function addItemToCart(cartId, productId, quantity) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = quantity + excluded.quantity
    `;
    db.run(query, [cartId, productId, quantity], function (err) {
      if (err) {
        return reject({
          status: 500,
          error: "Database error while adding item to cart",
        });
      }
      resolve();
    });
  });
}

// Get user from Users table
function getUser(userId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE ID = ?";
    db.get(query, [userId], (err, user) => {
      if (err) {
        return reject({ status: 500, error: "Database error" });
      }

      if (!user) {
        return reject({ status: 401, error: "Invalid user" });
      }

      resolve(user);
    });
  });
}

export default router;
