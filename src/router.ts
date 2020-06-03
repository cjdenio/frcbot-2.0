import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("<h1>FRCBot 2.0</h1>");
});

export default router;
