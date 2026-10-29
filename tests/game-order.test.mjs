import { test } from "node:test";
import assert from "node:assert/strict";
import { recentGames, recommendedGames } from "../src/utils/game-order.ts";
const game = (id, grade, lastPlayed, order = 0) => ({
	id,
	data: {
		grade,
		lastPlayed: lastPlayed ? new Date(lastPlayed) : undefined,
		recommendationOrder: order,
	},
});
test("recent excludes missing dates and sorts stably", () => {
	assert.deepEqual(
		recentGames([
			game("z", "S", "2026-01-01"),
			game("a", undefined, "2026-01-01"),
			game("b", "S+"),
		]).map((g) => g.id),
		["a", "z"],
	);
	assert.equal(
		recentGames(
			Array.from({ length: 12 }, (_, i) => game("g" + i, "S", "2026-01-01")),
		).length,
		10,
	);
});
test("recommendations use grade then author order then slug", () => {
	assert.deepEqual(
		recommendedGames([
			game("a", "A"),
			game("b", undefined),
			game("z", "S", undefined, -1),
			game("c", "S+"),
			game("b", "S"),
			game("a", "S"),
		]).map((g) => g.id),
		["c", "z", "a", "b"],
	);
	assert.deepEqual(recommendedGames([]), []);
	assert.equal(
		recommendedGames(Array.from({ length: 12 }, (_, i) => game("g" + i, "S")))
			.length,
		10,
	);
});
import { validateGameSlug } from "../src/utils/game-order.ts";
test("reject reserved and malformed slugs", () => {
	for (const id of ["service", "product", "a/b", "A"])
		assert.throws(() => validateGameSlug(id));
	validateGameSlug("minecraft");
});

import { publishedGames } from "../src/utils/game-order.ts";
test("drafts never enter any list and an empty library is valid", () => {
	assert.deepEqual(publishedGames([{ data: { draft: true } }]), []);
	assert.deepEqual(publishedGames([]), []);
	assert.equal(publishedGames([{ data: { draft: false } }]).length, 1);
});
