function filterGames(): void {
	const query =
		document
			.querySelector<HTMLInputElement>("[data-game-search]")
			?.value.trim()
			.toLowerCase() ?? "";
	const tag =
		document.querySelector<HTMLSelectElement>("[data-game-tag]")?.value ?? "";
	for (const row of document.querySelectorAll<HTMLElement>("[data-game-entry]"))
		row.hidden =
			!row.dataset.search?.includes(query) ||
			(!!tag && !JSON.parse(row.dataset.tags ?? "[]").includes(tag));
}
document.addEventListener("input", (event) => {
	if (
		event.target instanceof Element &&
		event.target.matches("[data-game-search]")
	)
		filterGames();
});
document.addEventListener("change", (event) => {
	if (
		event.target instanceof Element &&
		event.target.matches("[data-game-tag]")
	)
		filterGames();
});
filterGames();
