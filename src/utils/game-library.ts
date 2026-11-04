import K from "@i18n/i18nKey";
import {i18n} from "@i18n/translation";
import {url} from "@utils/url-utils";
import {
	publishedGames,
	validateGameSlug,
	compareGameReviews,
} from "./game-order";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { resolveAsset } from "@utils/asset-utils";
import { gamesConfig } from "@/config/gamesConfig";
export type LibraryGame = CollectionEntry<"games"> & { coverUrl: string };
export async function getGames(): Promise<LibraryGame[]> {
	if (!gamesConfig.enable) return [];
	const entries = await getCollection("games");
	for (const e of entries) validateGameSlug(e.id);
	const routes = new Set(entries.map(e => e.id));
	for (const e of entries) {
		for (const alias of gameAliases(e)) {
			validateGameSlug(alias);
			if (routes.has(alias)) throw new Error(`Duplicate game route: ${alias}`);
			routes.add(alias);
		}
	}
	return Promise.all(
		publishedGames(entries)
			.filter(
				(e) =>
					!gamesConfig.disabledIds?.includes(e.id) &&
					!gamesConfig.disabledKeys?.includes(e.id),
			)
			.sort(compareGameReviews)
			.map(async (e) => ({
				...e,
				coverUrl: await resolveGameCover(
					e.data.cover,
					e.filePath
						? path.relative(path.resolve("src"), path.dirname(e.filePath))
						: "content/games/" + e.id,
				),
			})),
	);
}
export { recentGames, recommendedGames } from "./game-order";

export function gameAliases(game: CollectionEntry<"games">): string[] {
	return [...new Set([
		...(game.data.aliases ?? []),
		...(game.data.steamAppId ? [`steam-${game.data.steamAppId}`] : []),
	])].filter(alias => alias !== game.id);
}

async function resolveGameCover(src: string, basePath: string): Promise<string> {
 const resolved = await resolveAsset(src, basePath);
 // A relative path returned unchanged means the asset was not found.
 return resolved === src && src && !/^(?:https?:|data:|\/)/.test(src) ? "" : resolved;
}

export function gameTaxonomy(games: LibraryGame[]) {
 const counts = new Map<string,number>();
 for (const game of games) for (const tag of new Set(game.data.tags)) counts.set(tag,(counts.get(tag) ?? 0)+1);
 return {
   categories: (["product","service"] as const).map(kind => ({
     name:i18n(kind==="product"?K.gamesProduct:K.gamesService), href:url("/games/"+kind+"/"),
     count:games.filter(game=>game.data.kind===kind).length,
   })),
   tags:[...counts].sort(([a],[b])=>a.localeCompare(b)).map(([name,count])=>({
     name,count,href:url("/games/all/")+"?gameTag="+encodeURIComponent(name),
   })),
 };
}
