const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("./auth");
const { validate, schemas } = require("../middleware/validation");
const rateLimit = require("express-rate-limit");

const vaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

router.post(
  "/Item",
  authenticateToken,
  validate(schemas.adding),
  vaultLimiter,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const newItem = req.body;

      const result = await User.updateOne(
        { _id: userId },
        { $push: { vault: newItem } },
      );

      if (result.matchedCount === 0)
        return res.status(404).json({ msg: "User not found" });

      res.json({ message: "Item added to vault array successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.delete("/Item", authenticateToken, vaultLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await User.updateOne(
      { _id: userId },
      { $set: { vault: [] } },
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ msg: "User not found" });
    res.json({ message: "Vault cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch(
  `/Item/:vault_id`,
  authenticateToken,
  vaultLimiter,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const vaultId = req.params.vault_id;
      const result = await User.updateOne(
        { _id: userId },
        { $pull: { vault: { _id: vaultId } } },
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ msg: "User not found" });
      if (result.modifiedCount === 0)
        return res.status(404).json({ msg: "Item not found in vault" });
      res.json({ message: "Delated an item" });
    } catch (err) {
      res.send(err);
    }
  },
);
router.get(`/item`, authenticateToken, vaultLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(vault);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.vault);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
