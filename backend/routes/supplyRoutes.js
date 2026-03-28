const express = require("express");
const router = express.Router();

const { getSuppliers, getSuppliersForMap } = require("../controllers/supplierController");

// existing route
router.get("/", getSuppliers);

// ✅ ADD THIS NEW ROUTE
router.get("/map", getSuppliersForMap);

module.exports = router;