export function gameSlug(title, appid, occupied = new Set()) {
  const stem = title.split(' / ')[0].replace(/[™®©]/g, '').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = stem || `steam-${appid}`;
  if (occupied.has(slug) || ['all', 'service', 'product'].includes(slug)) slug += `-${appid}`;
  if (occupied.has(slug)) throw new Error(`Duplicate game directory: ${slug}`);
  return slug;
}

// Deliberately excludes themes, visual styles, mood and commercial descriptors.
const gameplay = new Map(Object.entries({
  'Puzzle': '解谜', 'Puzzle Platformer': '平台解谜', 'Precision Platformer': '精准平台跳跃',
  'Platformer': '平台跳跃', 'Metroidvania': '类银河战士恶魔城', 'Exploration': '探索',
  'Roguelike': 'Roguelike', 'Roguelite': 'Roguelike', 'Action Roguelike': '动作Roguelike',
  'Deckbuilding': '牌组构筑', 'Roguelike Deckbuilder': '牌组构筑', 'Card Battler': '卡牌对战',
  'Turn-Based Combat': '回合制战斗', 'Turn-Based Tactics': '回合制战术',
  'Real Time Tactics': '即时战术', 'RTS': '即时战略', 'Tower Defense': '塔防',
  'Resource Management': '资源管理', 'Base Building': '基地建造', 'City Builder': '城市建造',
  'Automation': '自动化', 'Farming Sim': '农场模拟', 'Survival': '生存', 'Crafting': '制作',
  'Stealth': '潜行', 'FPS': '第一人称射击', 'Third-Person Shooter': '第三人称射击',
  'Bullet Hell': '弹幕', 'Shoot \'Em Up': '清版射击', 'Hack and Slash': '砍杀',
  'Souls-like': '类魂', 'Fighting': '格斗', 'Rhythm': '节奏', 'Racing': '竞速',
  'Point & Click': '指向点击', 'Hidden Object': '寻物', 'Investigation': '调查',
  'Choices Matter': '选择分支', 'Visual Novel': '视觉小说', 'Walking Simulator': '步行模拟',
  'Interactive Fiction': '互动叙事', 'Social Deduction': '社交推理',
  'MOBA': 'MOBA', 'Battle Royale': '大逃杀', 'Sandbox': '沙盒',
}));
export function selectGameplayTags(tags) {
  return [...new Set(tags.map(tag => gameplay.get(tag)).filter(Boolean))].slice(0, 5);
}
export function parseStoreTags(html) {
  return [...html.matchAll(/<a\b[^>]*class=["'][^"']*\bapp_tag\b[^"']*["'][^>]*>([\s\S]*?)<\/a>/g)]
    .map(match => match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").trim());
}
