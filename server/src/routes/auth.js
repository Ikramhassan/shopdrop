const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const db = require("../db");

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name required" });
    }
    const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const id = uuid();
    db.prepare(
      "INSERT INTO users (id, email, password, name, phone) VALUES (?, ?, ?, ?, ?)"
    ).run(id, email.toLowerCase(), hash, name, phone || null);

    const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(id);
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email?.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", require("../middleware/auth").auth, (req, res) => {
  const user = db
    .prepare("SELECT id, email, name, phone, address, role, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  res.json(user);
});

router.put("/me", require("../middleware/auth").auth, (req, res) => {
  const { name, phone, address } = req.body;
  db.prepare("UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?").run(
    name, phone, address, req.user.id
  );
  res.json({ success: true });
});

module.exports = router;
