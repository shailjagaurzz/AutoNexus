const mongoose = require("mongoose");
const Supplier = require("../models/Supplier");  // adjust path
const SUPPLIERS = [
  { name: "Nagpur Steel Works",      country: "India", state: "Maharashtra", city: "Nagpur",    location: { lat: 21.15, lng: 79.09 }, products: ["steel"] },
  { name: "Raipur Minerals Co.",     country: "India", state: "Chhattisgarh", city: "Raipur",   location: { lat: 21.25, lng: 81.63 }, products: ["iron ore"] },
  { name: "Bhopal Industrial",       country: "India", state: "Madhya Pradesh", city: "Bhopal", location: { lat: 23.26, lng: 77.41 }, products: ["steel", "hydraulics"] },
  { name: "Jabalpur Metals",         country: "India", state: "Madhya Pradesh", city: "Jabalpur",location: { lat: 23.17, lng: 79.94 }, products: ["copper", "steel"] },
  { name: "Sambalpur Ores",          country: "India", state: "Odisha",       city: "Sambalpur", location: { lat: 21.47, lng: 83.97 }, products: ["bauxite", "coal"] },
  { name: "Amravati Agri Exports",   country: "India", state: "Maharashtra",  city: "Amravati",  location: { lat: 20.93, lng: 77.75 }, products: ["soybean"] },
  { name: "Bilaspur Logistics Hub",  country: "India", state: "Chhattisgarh", city: "Bilaspur", location: { lat: 22.09, lng: 82.14 }, products: ["steel", "iron ore"] },
];

mongoose.connect("mongodb://localhost:27017/supplierDB").then(async () => {
  await Supplier.deleteMany({});
  await Supplier.insertMany(SUPPLIERS);
  console.log("✅ Seeded", SUPPLIERS.length, "suppliers");
  process.exit(0);
});
```


---

## Step 2 — Backend route file

Share whichever file in your backend handles routes — likely one of:
```
backend/routes/suppliers.js
backend/routes/api.js
server/routes/suppliers.js