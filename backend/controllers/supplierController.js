const Supplier = require("../models/Supplier"); // ✅ FIXED PATH

// ✅ 1. Basic API (already using)
exports.getSuppliers = async (req, res) => {
  try {
    const { product, country } = req.query;

    const suppliers = await Supplier.find({
      products: product,
      country: country
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ 2. Map API (NEW)
exports.getSuppliersForMap = async (req, res) => {
  try {
    const { product, country } = req.query;

    const suppliers = await Supplier.find({
      products: product,
      country: country
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};