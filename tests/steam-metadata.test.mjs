import test from 'node:test';
import assert from 'node:assert/strict';
import { gameSlug, parseStoreTags, selectGameplayTags } from '../scripts/steam/game-metadata.mjs';
test('readable slugs handle punctuation, collisions and reserved routes', () => {
  assert.equal(gameSlug('Titanfall® 2', 123), 'titanfall-2');
  assert.equal(gameSlug('Product', 123), 'product-123');
  assert.equal(gameSlug('Portal 2', 620, new Set(['portal-2'])), 'portal-2-620');
  assert.equal(gameSlug('中文', 123), 'steam-123');
});
test('store tags preserve gameplay only and normalize duplicates', () => {
  const html = '<a class="app_tag" href="/tags/"> Puzzle </a><a class="app_tag">Point &amp; Click</a>';
  assert.deepEqual(parseStoreTags(html), ['Puzzle', 'Point & Click']);
  assert.deepEqual(selectGameplayTags(['Cute', 'Puzzle', 'Pixel Graphics', 'Roguelike', 'Roguelite']), ['解谜', 'Roguelike']);
});
