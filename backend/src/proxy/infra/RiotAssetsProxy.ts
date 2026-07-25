import { Readable } from "node:stream";
import { Router } from "express";
import { dataDragonClient } from "../../champion/infra/DataDragonClient.js";

export const assetsRouter = Router();

assetsRouter.get("/champion/:fileName", async (request, response) => {
  const patch = await dataDragonClient.getCurrentPatch();
  await proxyAsset(
    `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${encodeURIComponent(request.params.fileName)}`,
    "image/png",
    response,
  );
});

assetsRouter.get(
  "/skin/:championName/:skinNum.jpg",
  async (request, response) => {
    await proxyAsset(
      `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${encodeURIComponent(request.params.championName)}_${encodeURIComponent(request.params.skinNum)}.jpg`,
      "image/jpeg",
      response,
    );
  },
);

assetsRouter.get("/ranked/:tier.png", async (request, response) => {
  await proxyAsset(
    `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${encodeURIComponent(request.params.tier.toLowerCase())}.png`,
    "image/png",
    response,
  );
});

assetsRouter.get(
  "/profile-icon/:iconId.png",
  async (request, response) => {
    const patch = await dataDragonClient.getCurrentPatch();
    await proxyAsset(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${encodeURIComponent(request.params.iconId)}.png`,
      "image/png",
      response,
    );
  },
);

async function proxyAsset(
  url: string,
  contentType: string,
  response: import("express").Response,
): Promise<void> {
  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    response.status(404).json({ error: "Asset no encontrado." });
    return;
  }

  response.set({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  });
  Readable.from(
    upstream.body as unknown as AsyncIterable<Uint8Array>,
  ).pipe(response);
}
