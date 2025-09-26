import Sweet from "../models/sweet.model.js";

export const addSweet = async (req, res) => {
  try {
    const { name, description, price, imageUrl, inStock, tags } = req.body;

    if (!name || typeof price === "undefined") {
      return res.status(400).json({ message: "name and price are required" });
    }

    const sweet = await Sweet.create({
      name,
      description,
      price,
      imageUrl,
      inStock,
      tags,
    });

    res.status(201).json(sweet);
  } catch (error) {
    console.error("Error adding sweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find({}).sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    console.error("Error listing sweets:", error.message);
    // If DB is not connected, respond with empty list so UI can still render
    if (String(error.message || '').match(/Client must be connected|MongooseError|ECONNREFUSED|connect/)) {
      return res.json([]);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchSweets = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(filter).sort({ createdAt: -1 });
    res.json(sweets);
  } catch (error) {
    console.error("Error searching sweets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, inStock, tags, category } = req.body;

    const update = {};
    if (typeof name !== "undefined") update.name = name;
    if (typeof description !== "undefined") update.description = description;
    if (typeof price !== "undefined") update.price = price;
    if (typeof imageUrl !== "undefined") update.imageUrl = imageUrl;
    if (typeof inStock !== "undefined") update.inStock = inStock;
    if (typeof tags !== "undefined") update.tags = tags;
    if (typeof category !== "undefined") update.category = category;

    const sweet = await Sweet.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    res.json(sweet);
  } catch (error) {
    console.error("Error updating sweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    if (sweet.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    sweet.quantity -= quantity;
    sweet.inStock = sweet.quantity > 0;
    await sweet.save();

    res.json(sweet);
  } catch (error) {
    console.error("Error purchasing sweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) return res.status(404).json({ message: "Sweet not found" });

    sweet.quantity += quantity;
    sweet.inStock = sweet.quantity > 0;
    await sweet.save();

    res.json(sweet);
  } catch (error) {
    console.error("Error restocking sweet:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


