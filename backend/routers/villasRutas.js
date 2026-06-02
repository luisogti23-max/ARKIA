import { Router } from "express";
import Villa from "../models/villaModelo.js";

const router = Router();

router.get('/villas', async (req, res) => {
  try {
    const villas = await Villa.find();
    res.json(villas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;