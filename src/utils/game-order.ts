import type { LibraryGame } from "./game-library";
export function recentGames(games: LibraryGame[]): LibraryGame[] {
	return games
		.filter((g) => g.data.lastPlayed)
		.sort(
			(a, b) =>
				b.data.lastPlayed!.getTime() - a.data.lastPlayed!.getTime() ||
				a.id.localeCompare(b.id, "en"),
		)
		.slice(0, 8);
}
export const recommendedGrades = ["S+", "S", "A"] as const;

export function recommendedGames(games: LibraryGame[]): LibraryGame[] {
	const grades: readonly string[] = recommendedGrades;
	return games
		.filter((g) => g.data.grade && grades.includes(g.data.grade))
		.sort(
			(a, b) =>
				grades.indexOf(a.data.grade!) - grades.indexOf(b.data.grade!) ||
				a.data.recommendationOrder - b.data.recommendationOrder ||
				a.id.localeCompare(b.id, "en"),
		);
}

export function validateGameSlug(id: string): void {
	if (
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
		["grades", "all", "service", "product", "reviews", "categories", "tags"].includes(id)
	)
		throw new Error("Invalid or reserved game slug: " + id);
}

export function publishedGames<T extends { data: { draft: boolean } }>(
	games: T[],
): T[] {
	return games.filter((game) => !game.data.draft);
}

export function selectGames(
	games: LibraryGame[],
	ids: string[] | undefined,
	automatic: (games: LibraryGame[]) => LibraryGame[],
): LibraryGame[] {
	if (ids === undefined) return automatic(games);
	const seen = new Set<string>();
	return ids
		.flatMap((id) => {
			if (seen.has(id)) return [];
			seen.add(id);
			const game = games.find((g) => g.id === id);
			return game ? [game] : [];
		});
}

/** Review activity, independent from playtime and filesystem timestamps. */
type ReviewGame = Pick<LibraryGame, "id" | "body" | "data">;
export function compareGameReviews(a: ReviewGame, b: ReviewGame): number {
	const group = (g: ReviewGame): number =>
		!g.body?.trim() ? 2 : g.data.reviewUpdated ? 0 : 1;
	return (
		group(a) - group(b) ||
		(group(a) === 0
			? b.data.reviewUpdated!.getTime() - a.data.reviewUpdated!.getTime()
			: 0) ||
		a.data.title.localeCompare(b.data.title, "zh-CN") ||
		a.id.localeCompare(b.id, "en")
	);
}
