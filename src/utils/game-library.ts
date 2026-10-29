import { publishedGames, validateGameSlug } from "./game-order";
import path from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { resolveAsset } from "@utils/asset-utils";
import { gamesConfig } from "@/config/gamesConfig";
export type LibraryGame = CollectionEntry<"games"> & { coverUrl: string };
export async function getGames(): Promise<LibraryGame[]> {
	if (!gamesConfig.enable) return [];
	const entries = await getCollection("games");
	for (const e of entries) validateGameSlug(e.id);
	return Promise.all(
		publishedGames(entries)
			.filter(
				(e) =>
					!gamesConfig.disabledIds?.includes(e.id) &&
					!gamesConfig.disabledKeys?.includes(e.id),
			)
			.sort((a, b) => a.id.localeCompare(b.id, "en"))
			.map(async (e) => ({
				...e,
				coverUrl: await resolveAsset(
					e.data.cover,
					e.filePath
						? path.relative(path.resolve("src"), path.dirname(e.filePath))
						: "content/games/" + e.id,
				),
			})),
	);
}
export { recentGames, recommendedGames } from "./game-order";
