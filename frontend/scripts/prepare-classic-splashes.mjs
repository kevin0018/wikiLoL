import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import archive from "../../backend/src/champion/infra/classicSplashArchive.json" with { type: "json" };

const tar = promisify(execFile);
const splashDirectory = "./img/champion/splash";
const archiveName = `dragontail-${archive.patch}.tgz`;
const cacheDirectory = fileURLToPath(new URL("../../node_modules/.cache/wikilol/", import.meta.url));
const outputDirectory = fileURLToPath(new URL(`../public/images/classic/${archive.patch}/`, import.meta.url));
const files = Object.entries(archive.skins).flatMap(([champion, skins]) =>
  skins.map((skin) => `${champion}_${skin}.jpg`),
);

async function fileHash(path) {
  const hash = createHash("sha256");
  try {
    for await (const chunk of createReadStream(path)) hash.update(chunk);
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
  return hash.digest("hex");
}

async function prepareSplashes() {
  await mkdir(outputDirectory, { recursive: true });
  const existing = new Set(await readdir(outputDirectory));
  const missing = files.filter((file) => !existing.has(file));
  if (missing.length === 0) return;

  await mkdir(cacheDirectory, { recursive: true });
  const staging = await mkdtemp(join(cacheDirectory, "classic-"));
  try {
    const cachedArchive = join(cacheDirectory, archiveName);
    if (await fileHash(cachedArchive) !== archive.sha256) {
      const temporaryArchive = join(staging, archiveName);
      const source = `https://ddragon.leagueoflegends.com/cdn/${archiveName}`;
      const response = await fetch(source, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok || !response.body) {
        throw new Error(`Data Dragon archive request failed with HTTP ${response.status}`);
      }
      await pipeline(response.body, createWriteStream(temporaryArchive));
      if (await fileHash(temporaryArchive) !== archive.sha256) {
        throw new Error(`Unexpected checksum for ${archiveName}`);
      }
      await rename(temporaryArchive, cachedArchive);
    }

    const members = join(staging, "members.txt");
    await writeFile(members, missing.map((file) => `${splashDirectory}/${file}\n`).join(""));
    await tar("tar", ["-xzf", cachedArchive, "-C", staging, "-T", members]);
    for (const file of missing) {
      await rename(join(staging, splashDirectory, file), join(outputDirectory, file));
    }
    console.log(`Prepared ${missing.length} Classic splash images from Data Dragon ${archive.patch}.`);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

await prepareSplashes();
