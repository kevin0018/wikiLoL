import { Readable } from "node:stream";
import { Router } from "express";
import {
  dataDragonClient,
  isClassicChampion,
} from "../../champion/infra/DataDragonClient.js";

export const assetsRouter = Router();

assetsRouter.get("/champion/:fileName", async (request, response) => {
  const patch = await dataDragonClient.getCurrentPatch();
  const { fileName } = request.params;
  const mode = isClassicChampion(fileName) ? "/mode/classic" : "";
  await proxyAsset(
    `https://ddragon.leagueoflegends.com/cdn/${patch}/img${mode}/champion/${encodeURIComponent(fileName)}`,
    "image/png",
    response,
  );
});

assetsRouter.get(
  "/skin/:championName/:skinNum.jpg",
  async (request, response) => {
    const { championName, skinNum } = request.params;
    const classic = isClassicChampion(championName);
    const mode = classic ? "/mode/classic" : "";
    const fallback = !classic && /^[a-z0-9]+$/i.test(championName) && /^\d+$/.test(skinNum)
      ? `https://cdn.communitydragon.org/latest/champion/${championName.toLowerCase()}/splash-art/skin/${skinNum}`
      : undefined;
    await proxyAsset(
      `https://ddragon.leagueoflegends.com/cdn/img${mode}/champion/splash/${encodeURIComponent(championName)}_${encodeURIComponent(skinNum)}.jpg`,
      "image/jpeg",
      response,
      fallback,
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

assetsRouter.get("/item/:patch/:itemId.png", async (request, response) => {
  const { patch, itemId } = request.params;
  if (!/^\d+\.\d+\.\d+$/.test(patch) || !/^\d+$/.test(itemId)) {
    response.status(404).json({ error: "Asset no encontrado." });
    return;
  }

  await proxyAsset(
    `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${itemId}.png`,
    "image/png",
    response,
  );
});

async function proxyAsset(
  url: string,
  contentType: string,
  response: import("express").Response,
  fallbackUrl?: string,
): Promise<void> {
  let upstream = await fetch(url).catch((error: unknown) => {
    if (!fallbackUrl) throw error;
    return null;
  });

  if (fallbackUrl && (!upstream?.ok || !upstream.body || !upstream.headers.get("content-type")?.startsWith("image/jpeg"))) {
    await upstream?.body?.cancel();
    upstream = await fetch(fallbackUrl).catch(() => null);
    if (upstream?.ok && !upstream.headers.get("content-type")?.startsWith("image/jpeg")) {
      await upstream.body?.cancel();
      upstream = null;
    }
  }

  if (!upstream?.ok || !upstream.body) {
    await upstream?.body?.cancel();
    response.set("Cache-Control", "no-store").status(404).json({ error: "Asset no encontrado." });
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
