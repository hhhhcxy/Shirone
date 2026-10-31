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
		if (current || link.dataset.defaultKind)
			target.pathname = target.pathname.replace(
				/\/games\/(service|product)\//,
				"/games/" + (current ?? link.dataset.defaultKind) + "/",
			);
		link.href = target.href;
		const serviceCount = Number(link.dataset.serviceCount ?? 0),
			productCount = Number(link.dataset.productCount ?? 0);
		const count =
			current === "service"
				? serviceCount
				: current === "product"
					? productCount
					: serviceCount + productCount;
		link.hidden = !!link.dataset.gameTagLink && count === 0;
		const badge = link.querySelector("span");
		if (badge) badge.textContent = String(count);
		if (tag === (link.dataset.gameTagLink ?? ""))
			link.setAttribute("aria-current", "true");
		else link.removeAttribute("aria-current");
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
