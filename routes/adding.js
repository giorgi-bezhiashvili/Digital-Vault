const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("./auth");

router.patch('/Item', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; 
        const newItem = req.body; // იღებს { "site": "...", "secret": "..." }

        const result = await User.updateOne(
            { _id: userId },
            { $push: { vault: newItem } } // ამატებს ახალ ობიექტს მასივის ბოლოში
        );

        if (result.matchedCount === 0) return res.status(404).json({ msg: "User not found" });

        res.json({ message: "Item added to vault array successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/Item', authenticateToken, async (req, res) => { 
    try { 
        const userId = req.user.id; 
        const result = await User.updateOne(
            { _id: userId },
            { $set: { vault: [] } } 
        );

        if (result.matchedCount === 0) return res.status(404).json({ msg: "User not found" });
        res.json({ message: "Vault cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;