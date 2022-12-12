const mongoose = require("mongoose");

const connectDB = async () => {
  const connecting = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connect to: ${connecting.connection.host}`);
};

module.exports = connectDB;
