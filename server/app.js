const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const ShoppingList = require("./models/shoppingList");
const GroceryItem = require("./models/groceryItem");
const User = require("./models/user");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : "*",
  })
);
app.use(bodyParser.json());

// connect to database
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log("Unable to connect to the database:", error);
  });

// User registration
app.post("/api/users/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post("/api/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      throw new Error("Invalid login credentials");
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      throw new Error("Invalid login credentials");
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected routes below
// delete grocery item
app.delete("/api/grocery-items/:groceryItemId", auth, async (req, res) => {
  try {
    const groceryItemId = req.params.groceryItemId;
    const shoppingList = await ShoppingList.findOne({
      "groceryItems._id": groceryItemId,
    });

    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    shoppingList.groceryItems = shoppingList.groceryItems.filter(
      (gi) => gi._id.toString() !== groceryItemId
    );

    const savedResult = await shoppingList.save();
    res.json({ message: "Saved", success: true });
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    res.status(500).json({ message: "Unable to delete grocery item!" });
  }
});

// add grocery item
app.post("/api/grocery-items", auth, async (req, res) => {
  try {
    const { name, price, quantity, shoppingListId } = req.body;

    const shoppingList = await ShoppingList.findById(shoppingListId);
    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    shoppingList.groceryItems.push({ name, price, quantity });
    const savedShoppingList = await shoppingList.save();

    res.json(savedShoppingList);
  } catch (error) {
    console.error("Error adding grocery item:", error);
    res.status(500).json({ message: "Unable to save grocery item" });
  }
});

// add shopping list
app.post("/api/shopping-lists", auth, async (req, res) => {
  try {
    // console.log("Received shopping list creation request:", req.body);
    // console.log("User ID:", req.user._id);

    const name = req.body.name;
    const address = req.body.address;

    let shoppingList = new ShoppingList({
      name: name,
      address: address,
      user: req.user._id,
    });

    // console.log("Shopping list to be saved:", shoppingList);

    let savedShoppingList = await shoppingList.save();
    // console.log("Saved shopping list:", savedShoppingList);

    if (savedShoppingList) {
      res.json(savedShoppingList);
    } else {
      res.status(500).json({ message: "Unable to save a shopping list!" });
    }
  } catch (error) {
    console.error("Error creating shopping list:", error);
    res
      .status(500)
      .json({ message: "Error creating shopping list", error: error.message });
  }
});

// get shopping lists
app.get("/api/shopping-lists", auth, async (req, res) => {
  try {
    let shoppingLists = await ShoppingList.find({ user: req.user._id });
    res.json(shoppingLists);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch shopping lists" });
  }
});

// get shopping list by id
app.get("/api/shopping-lists/:shoppingListId", auth, async (req, res) => {
  try {
    const shoppingListId = req.params.shoppingListId;
    const shoppingList = await ShoppingList.findOne({
      _id: shoppingListId,
      user: req.user._id,
    });

    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found" });
    }

    return res.json(shoppingList);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch shopping list" });
  }
});

// delete shopping list
app.delete("/api/shopping-lists/:shoppingListId", auth, async (req, res) => {
  try {
    const shoppingListId = req.params.shoppingListId;
    const result = await ShoppingList.findOneAndDelete({
      _id: shoppingListId,
      user: req.user._id,
    });

    if (result) {
      res.json({
        success: true,
        message: "Shopping list deleted successfully",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Shopping list not found" });
    }
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to delete shopping list" });
  }
});

// Update username
app.patch("/api/users/update-username", auth, async (req, res) => {
  try {
    const { newUsername } = req.body;

    // Check if username is already taken
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Update username
    const user = await User.findById(req.user._id);
    user.username = newUsername;
    await user.save();

    res.json({ message: "Username updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update username" });
  }
});

// Change password
app.patch("/api/users/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Delete account
app.delete("/api/users/delete-account", auth, async (req, res) => {
  try {
    // Delete all shopping lists associated with the user
    await ShoppingList.deleteMany({ user: req.user._id });

    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running..");
});
