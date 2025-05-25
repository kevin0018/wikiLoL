import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Proxy for champion icons with version support
router.get("/champion/:version/:championName", async (req, res) => {
    const { version, championName } = req.params;
    // Build Riot CDN URL
    const riotUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}`;
    try {
        const response = await fetch(riotUrl);
        if (!response.ok) {
            return res.status(404).send("Imagen no encontrada");
        }
        res.set("Content-Type", "image/png");
        response.body.pipe(res);
    } catch (err) {
        res.status(500).send("Error al obtener la imagen");
    }
});

router.get("/skin/splash/:championName/:skinNum.jpg", async (req, res) => {
  const { championName, skinNum } = req.params;
  const riotUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_${skinNum}.jpg`;

  try {
    const response = await fetch(riotUrl);
    if (!response.ok) {
      return res.status(404).send("Imagen no encontrada");
    }
    res.set("Content-Type", "image/jpeg");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Error al obtener la imagen");
  }
});

export default router;