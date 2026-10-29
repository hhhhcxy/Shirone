/** Article tools belong to article pages; a personal landing page is independent. */
export function isArticlePage(
	page: string | undefined,
	separateHome = false,
): boolean {
	return (
		["blog", "archive", "categories", "tags", "post", "series"].includes(
			page ?? "",
		) ||
		(!separateHome && page === "home")
	);
}
export function sectionNavigationKey(
	routeKey: string,
	page: string | undefined,
	separateHome = false,
): string {
	return separateHome && isArticlePage(page, true) ? "blog" : routeKey;
}
