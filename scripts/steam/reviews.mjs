import fs from "node:fs/promises";
import path from "node:path";
import { applyReview } from "./review-content.mjs";
const root = path.resolve(process.argv[2] ?? ".");
const maxPages = Number(process.argv[3] ?? 5);
if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 50)
	throw Error("Page limit must be 1..50");
const profile = await fs.readFile(
	path.join(root, "config/profile.yaml"),
	"utf8",
);
const steamid = profile.match(/steamcommunity\.com\/profiles\/(\d+)/)?.[1];
if (!steamid) throw Error("Numeric Steam profile URL required");
const directory = path.join(root, "content/games");
const cache = path.join(root, ".work/steam-reviews");
await fs.mkdir(cache, { recursive: true });
const items = [];
for (const dir of await fs.readdir(directory, { withFileTypes: true }))
	if (dir.isDirectory()) {
		const file = path.join(directory, dir.name, "index.md");
		try {
			const text = await fs.readFile(file, "utf8");
			const appid = Number(text.match(/^steamAppId:\s*(\d+)/m)?.[1]);
			if (appid) items.push({ file, text, appid });
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}
	}
const results = [];
async function scan(item) {
	let cursor = "*";
	const seen = new Set();
	try {
		for (let page = 0; page < maxPages; page++) {
			const u = new URL(
				"https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/",
			);
			u.searchParams.set(
				"input_json",
				JSON.stringify({
					appid: item.appid,
					filter: 2,
					languages: ["all"],
					purchase_type: 2,
					filter_offtopic_activity: false,
					num_per_page: 100,
					cursor,
				}),
			);
			const res = await fetch(u, { signal: AbortSignal.timeout(20000) });
			if (!res.ok) throw Error("HTTP " + res.status);
			const data = (await res.json()).response;
			if (!Array.isArray(data?.reviews)) throw Error("Invalid response");
			const review = data.reviews.find(
				(r) => String(r.author?.steamid) === steamid,
			);
			if (review) {
				const result = applyReview(item.text, review, steamid, item.appid);
				await fs.writeFile(
					path.join(cache, item.appid + ".json"),
					JSON.stringify(review, null, 2),
				);
				if (result.status === "imported")
					await fs.writeFile(item.file, result.text);
				return { appid: item.appid, status: result.status };
			}
			if (data.reviews.length === 0)
				return { appid: item.appid, status: "not-found" };
			if (!data.cursor || seen.has(data.cursor))
				return { appid: item.appid, status: "incomplete" };
			seen.add(data.cursor);
			cursor = data.cursor;
		}
		return { appid: item.appid, status: "incomplete" };
	} catch (e) {
		return { appid: item.appid, status: "failed", reason: e.message };
	}
}
let next = 0;
await Promise.all(
	Array.from({ length: 2 }, async () => {
		while (next < items.length) {
			const item = items[next++];
			const result = await scan(item);
			results.push(result);
			console.log(result.appid, result.status);
		}
	}),
);
await fs.writeFile(
	path.join(cache, "status.json"),
	JSON.stringify(results, null, 2),
);
console.log(
	results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}),
);
