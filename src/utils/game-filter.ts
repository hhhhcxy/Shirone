function syncGameTags(): void {
	const tag = new URL(location.href).searchParams.get("gameTag") ?? "";
	const current =
		document.querySelector<HTMLElement>("[data-game-kind]")?.dataset.gameKind;
	const rows = [...document.querySelectorAll<HTMLElement>("[data-game-entry]")];
	for (const row of rows)
		row.hidden = !!tag && !JSON.parse(row.dataset.tags ?? "[]").includes(tag);
	const empty = document.querySelector<HTMLElement>("[data-game-empty]");
	if (empty) empty.hidden = rows.some((row) => !row.hidden);
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		"[data-game-tag-link]",
	)) {
		const target = new URL(link.href);
		target.pathname = target.pathname.replace(
			/\/games\/(all|service|product)\//,
			"/games/" + (current ?? "all") + "/",
		);
		link.href = target.href;
		if (tag === (link.dataset.gameTagLink ?? ""))
			link.setAttribute("aria-current", "true");
		else link.removeAttribute("aria-current");
	}
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		"[data-games-nav] a",
	)) {
		const target = new URL(link.href);
		if (tag && /\/games\/(all|service|product)\/$/.test(target.pathname))
			target.searchParams.set("gameTag", tag);
		else target.searchParams.delete("gameTag");
		link.href = target.href;
	}
}
syncGameTags();
let bound = false;
function bind(): void {
	if (bound || !window.swup?.hooks) return;
	bound = true;
	window.swup.hooks.on("page:view", syncGameTags);
	window.swup.hooks.on("content:replace", syncGameTags);
}
bind();
document.addEventListener("swup:enable", bind);
let attempts = 0;
const timer: ReturnType<typeof setInterval> = setInterval(() => {
	bind();
	if (bound || ++attempts >= 40) clearInterval(timer);
}, 50);
