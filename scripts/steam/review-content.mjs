// Steam text is untrusted content: escape HTML and preserve unknown BBCode as text.
export function reviewMarkdown(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(
			/\[h([1-3])\]([\s\S]*?)\[\/h\1\]/gi,
			(_, n, t) => "\n" + "#".repeat(Number(n)) + " " + t + "\n",
		)
		.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "**$1**")
		.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "*$1*")
		.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "$1")
		.replace(/\[strike\]([\s\S]*?)\[\/strike\]/gi, "~~$1~~")
		.replace(
			/\[url=(https?:\/\/[^\s\]]+)\]([\s\S]*?)\[\/url\]/gi,
			(_, url, label) =>
				"[" +
				label.replace(/[\[\]]/g, "") +
				"](" +
				url.replace(/[()]/g, (c) => encodeURIComponent(c)) +
				")",
		)
		.replace(/\[\*\]/g, "\n- ")
		.replace(/\[\/?(?:list|olist)\]/gi, "\n")
		.trim();
}
export function applyReview(text, review, steamid, appid) {
	if (String(review.author?.steamid) !== steamid)
		throw Error("Review author mismatch");
	const match = text.match(/^(---\r?\n[\s\S]*?\r?\n---)(?:\r?\n|$)([\s\S]*)$/);
	if (!match) throw Error("Invalid frontmatter");
	const body = reviewMarkdown(review.review ?? "");
	if (!body) return { status: "empty", text };
	if (match[2].trim())
		return {
			status: match[2].trim() === body ? "unchanged" : "preserved",
			text,
		};
	const stamp = review.timestamp_updated || review.timestamp_created;
	if (!Number.isFinite(stamp) || stamp <= 0)
		throw Error("Missing review timestamp");
	let head = match[1].slice(0, -3).trimEnd();
	head = head
		.replace(/^reviewUpdated:.*\r?\n?/m, "")
		.replace(/^steamReviewUrl:.*\r?\n?/m, "")
		.trimEnd();
	return {
		status: "imported",
		text:
			head +
			"\nreviewUpdated: " +
			new Date(stamp * 1000).toISOString() +
			"\nsteamReviewUrl: https://steamcommunity.com/profiles/" +
			steamid +
			"/recommended/" +
			appid +
			"/\n---\n\n" +
			body +
			"\n",
	};
}
