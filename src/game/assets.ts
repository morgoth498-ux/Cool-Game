import type { EnemyKind, HeroId } from "./content";
import { HEROES, maxRank } from "./content";
import type { PropKind } from "./map";

export type SpriteName = HeroId | EnemyKind | PropKind | "bg" | "garden" | "boss15" | "boss20" | "boss30";

const SRC: Record<SpriteName, string> = {
  lyra: "/sprites/heroes/lyra.png",
  vespera: "/sprites/heroes/vespera.png",
  melody: "/sprites/heroes/melody.png",
  kage: "/sprites/heroes/kage.png",
  mira: "/sprites/heroes/mira.png",
  liora: "/sprites/heroes/liora-r0.png",
  nyx: "/sprites/heroes/nyx-r0.png",
  elara: "/sprites/heroes/elara.png",
  sable: "/sprites/heroes/sable.png",
  nima: "/sprites/heroes/nima.png",
  vera: "/sprites/heroes/vera.png",
  selene: "/sprites/heroes/selene.png",
  audrey: "/sprites/heroes/audrey-r0.png",
  daley: "/sprites/heroes/daley-r0.png",
  mizukui: "/sprites/heroes/mizukui-r0.png",
  ursa: "/sprites/heroes/ursa-r0.png",
  xaya: "/sprites/heroes/xaya-r0.png",
  nami: "/sprites/heroes/nami-r0.png",
  kaede: "/sprites/heroes/kaede-r0.png",
  vexa: "/sprites/heroes/vexa-r0.png",
  scout: "/sprites/enemies/scout.png",
  runner: "/sprites/enemies/runner.png",
  brute: "/sprites/enemies/brute.png",
  wisp: "/sprites/enemies/wisp.png",
  boss: "/sprites/enemies/boss.png",
  boss15: "/sprites/enemies/boss15.png",
  boss20: "/sprites/enemies/boss20.png",
  boss30: "/sprites/enemies/boss30.png",
  tree: "/sprites/props/tree.png",
  crystal: "/sprites/props/crystal.png",
  shrine: "/sprites/props/shrine.png",
  bloom: "/sprites/props/bloom.png",
  bg: "/sprites/bg.jpg",
  garden: "/sprites/garden.jpg",
};

const cache = new Map<SpriteName, HTMLImageElement>();
const skinCache = new Map<string, HTMLImageElement>();

function skinKey(id: HeroId, rank: number): string {
  return `${id}-r${rank}`;
}

const equipped = new Set<string>();

export function setEquippedSkins(ids: readonly string[]): void {
  equipped.clear();
  for (const id of ids) equipped.add(id);
}

export function heroSkinUrl(id: HeroId, rank: number): string {
  if (id === "kage" && equipped.has("kage-academy")) return "/sprites/heroes/kage-academy.png";
  if (id === "lyra" && equipped.has("lyra-shop")) return "/sprites/heroes/lyra-shop.png";
  if (id === "audrey" && equipped.has("audrey-nude")) return "/sprites/heroes/audrey-nude.png";
  if (id === "liora") return rank >= 5 ? "/sprites/heroes/liora-r5.png" : "/sprites/heroes/liora-r0.png";
  if (id === "audrey" || id === "daley" || id === "mizukui" || id === "ursa" || id === "xaya" || id === "nami" || id === "nyx" || id === "kaede" || id === "vexa") return `/sprites/heroes/${id}-r0.png`;
  const r = Math.max(0, Math.min(maxRank(id), rank));
  return `/sprites/heroes/${id}-r${r}.png`;
}

export function getSprite(name: SpriteName): HTMLImageElement | null {
  return cache.get(name) ?? null;
}

export function hasHeroSkin(id: HeroId, rank: number): boolean {
  const r = Math.max(0, Math.min(maxRank(id), rank));
  return skinCache.has(skinKey(id, r));
}

export function getHeroSprite(id: HeroId, rank: number): HTMLImageElement | null {
  const r = Math.max(0, Math.min(maxRank(id), rank));
  if (id === "kage" && equipped.has("kage-academy")) {
    return skinCache.get("kage-academy") ?? skinCache.get(skinKey(id, r)) ?? cache.get(id) ?? null;
  }
  if (id === "lyra" && equipped.has("lyra-shop")) {
    return skinCache.get("lyra-shop") ?? skinCache.get(skinKey(id, r)) ?? cache.get(id) ?? null;
  }
  if (id === "audrey" && equipped.has("audrey-nude")) {
    return skinCache.get("audrey-nude") ?? skinCache.get(skinKey(id, r)) ?? cache.get(id) ?? null;
  }
  for (let i = r; i >= 0; i--) {
    const img = skinCache.get(skinKey(id, i));
    if (img) return img;
  }
  return cache.get(id) ?? null;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function loadSprites(): Promise<void> {
  const entries = Object.entries(SRC) as [SpriteName, string][];
  const base = entries.map(async ([name, src]) => {
    const img = await loadImage(src);
    if (img) cache.set(name, img);
  });
  const skins = HEROES.flatMap((hero) =>
    Array.from({ length: maxRank(hero.id) + 1 }, (_, rank) => rank).map(async (rank) => {
      const img = await loadImage(heroSkinUrl(hero.id, rank));
      if (img) skinCache.set(skinKey(hero.id, rank), img);
    }),
  );
  const academy = loadImage("/sprites/heroes/kage-academy.png").then((img) => {
    if (img) skinCache.set("kage-academy", img);
  });
  const lyraShop = loadImage("/sprites/heroes/lyra-shop.png").then((img) => {
    if (img) skinCache.set("lyra-shop", img);
  });
  const audreyNude = loadImage("/sprites/heroes/audrey-nude.png").then((img) => {
    if (img) skinCache.set("audrey-nude", img);
  });
  return Promise.all([...base, ...skins, academy, lyraShop, audreyNude]).then(() => undefined);
}