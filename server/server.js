const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/financeDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const transactionSchema = new mongoose.Schema({
    date: String,
    amount: Number,
    category: String,
    type: String
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Routes

// GET
app.get("/transactions", async (req, res) => {
    const data = await Transaction.find();
    res.json(data);
});

// POST
app.post("/transactions", async (req, res) => {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.json(newTransaction);
});

// DELETE
app.delete("/transactions/:id", async (req, res) => {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// PUT
app.put("/transactions/:id", async (req, res) => {
    await Transaction.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Updated" });
});

app.listen(5000, () => console.log("Server running on port 5000"));