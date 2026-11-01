import { test } from "node:test";
import assert from "node:assert/strict";
import {
	applyReview,
	reviewMarkdown,
} from "../scripts/steam/review-content.mjs";
import { compareGameReviews } from "../src/utils/game-order.ts";
import { resolveBannerState } from "../src/utils/banner-state.ts";
const source = "---\ntitle: Test\nkind: product\n---\n";
const review = {
	author: { steamid: "123" },
	review: "[b]Good[/b] <script>x</script>",
	timestamp_updated: 1700000000,
};
test("review imports only verified authors into empty bodies", () => {
	const r = applyReview(source, review, "123", 1);
	assert.equal(r.status, "imported");
	assert.match(r.text, /reviewUpdated: 2023/);
	assert.match(r.text, /\*\*Good\*\* &lt;script&gt;/);
	assert.equal(applyReview(r.text, review, "123", 1).status, "unchanged");
	assert.throws(() => applyReview(source, review, "456", 1));
	assert.equal(
		applyReview(source + "My local review", review, "123", 1).text,
		source + "My local review",
	);
	assert.equal(
		applyReview(source, { ...review, review: "" }, "123", 1).status,
		"empty",
	);
});
test("review order distinguishes dated, undated and empty reviews", () => {
	const g = (id, body, date) => ({
		id,
		body,
		data: { title: id, reviewUpdated: date ? new Date(date) : undefined },
	});
	const entries = [
		g("empty", "", "2026-01-01"),
		g("undated", "text"),
		g("old", "text", "2024-01-01"),
		g("new", "text", "2025-01-01"),
		g("aaa", "text", "2025-01-01"),
	];
	assert.deepEqual(
		entries.sort(compareGameReviews).map((g) => g.id),
		["aaa", "new", "old", "undated", "empty"],
	);
});
test("games keep banner images without contextual copy", () => {
	const base = {
		mode: "banner",
		viewport: "desktop",
		imageCount: 1,
		carouselEnabled: false,
		reducedMotion: false,
	};
	assert.equal(resolveBannerState({ ...base, page: "games" }).copyMode, null);
	assert.equal(resolveBannerState({ ...base, page: "games" }).visible, true);
	assert.equal(
		resolveBannerState({ ...base, page: "post" }).copyMode,
		"context",
	);
});
