import type { LibraryGame } from "./game-library";
export function recentGames(games: LibraryGame[]): LibraryGame[] {
	return games
		.filter((g) => g.data.lastPlayed)
		.sort(
			(a, b) =>
				b.data.lastPlayed!.getTime() - a.data.lastPlayed!.getTime() ||
				a.id.localeCompare(b.id, "en"),
		)
		.slice(0, 10);
}
export function recommendedGames(games: LibraryGame[]): LibraryGame[] {
	const grades = ["S+", "S", "A", "B", "C"];
	return games
		.filter((g) => g.data.grade && grades.indexOf(g.data.grade) <= 1)
		.sort(
			(a, b) =>
				grades.indexOf(a.data.grade!) - grades.indexOf(b.data.grade!) ||
				a.data.recommendationOrder - b.data.recommendationOrder ||
				a.id.localeCompare(b.id, "en"),
		)
		.slice(0, 10);
}

export function validateGameSlug(id: string): void {
	if (
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
		["service", "product"].includes(id)
	)
		throw new Error("Invalid or reserved game slug: " + id);
}

export function publishedGames<T extends { data: { draft: boolean } }>(
	games: T[],
): T[] {
	return games.filter((game) => !game.data.draft);
}
