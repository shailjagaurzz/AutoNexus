const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    state: String,
    city: String,
    location:{
    lat: Number,
    long: Number
    },
    products: [String] // simple for now
  
});

module.exports = mongoose.model('Supplier', supplierSchema);
