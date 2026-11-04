function syncGameTags(): void {
	const tag = new URL(location.href).searchParams.get("gameTag") ?? "";
	const current =
		document.querySelector<HTMLElement>("[data-game-kind]")?.dataset.gameKind;
	const rows = [...document.querySelectorAll<HTMLElement>("[data-game-entry]")];
	for (const row of rows)
		row.hidden = !!tag && !JSON.parse(row.dataset.tags ?? "[]").includes(tag);
	const empty = document.querySelector<HTMLElement>("[data-game-empty]");
	if (empty) empty.hidden = rows.some((row) => !row.hidden);
	const status = document.querySelector<HTMLElement>("[data-game-filter-summary]");
 if (status) {
   status.hidden = !tag;
   const text = status.querySelector("[data-game-filter-text]");
   if (text) text.textContent = "#"+tag+" · "+rows.filter(row=>!row.hidden).length;
 }
 for (const link of document.querySelectorAll<HTMLAnchorElement>("#game-tags .m3-blog-taglist a")) {
   const target = new URL(link.href);
   target.pathname = target.pathname.replace(/\/games\/(all|service|product|reviews)\//, "/games/"+(current && ["product","service","reviews"].includes(current)?current:"all")+"/");
   link.href = target.href;
   const selected = Boolean(tag) && target.searchParams.get("gameTag")===tag;
   link.classList.toggle("m3-chip--selected",selected);
   if(selected) link.setAttribute("aria-current","true"); else link.removeAttribute("aria-current");
 }
 for (const link of document.querySelectorAll<HTMLAnchorElement>(
		"#game-categories .m3-blog-categorylist a, .category-index__row[href*='/games/'], [data-games-nav] a",
	)) {
		const target = new URL(link.href);
		if (tag && /\/games\/(categories|reviews|service|product)\/$/.test(target.pathname))
			target.searchParams.set("gameTag", tag);
		else target.searchParams.delete("gameTag");
		link.href = target.href;
	}
 const nav=document.querySelector<HTMLElement>("[data-games-nav]");
 if (nav) {
   const section=nav.dataset.section || "";
   const active=tag && section==="all"?"tags":["product","service"].includes(section)?"categories":section;
   for(const link of nav.querySelectorAll("a")) {
     const key=new URL(link.href).pathname.split("/games/").pop()?.replace(/\/$/,"");
     const selected=key===active;
     link.classList.toggle("m3-chip--selected",selected);
     if(selected)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
   }
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
