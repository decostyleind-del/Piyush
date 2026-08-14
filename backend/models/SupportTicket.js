const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

// This line is crucial! It tells Node.js that this is a Mongoose Model with functions like .create()
module.exports = mongoose.model("SupportTicket", supportTicketSchema);
