export function championSplashUrl(portraitUrl: string | undefined): string | undefined {
  const championId = portraitUrl?.match(/\/champion\/([A-Za-z0-9]+)\.png$/)?.[1];
  return championId ? `/api/assets/skin/${championId}/0.jpg` : undefined;
}
