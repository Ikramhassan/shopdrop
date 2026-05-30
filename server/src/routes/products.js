const router = require("express").Router();
const aliexpress = require("../services/aliexpress");

router.get("/search", async (req, res) => {
  try {
    const { q = "trending", page = 1, pageSize = 20 } = req.query;
    const result = await aliexpress.searchProducts({
      query: q,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await aliexpress.getProductDetail({ productId: req.params.id });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
