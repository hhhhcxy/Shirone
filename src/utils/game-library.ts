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
