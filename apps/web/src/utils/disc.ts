import type { DiscType } from "@/data/disc-colors";

const CDN_BASE =
	"https://7072-prod-d1gj2nkrx05fb1c16-1444533815.tcb.qcloud.la/static-images";

export function getCompositeType(scores: Record<DiscType, number>): string {
	const sorted = (["D", "I", "S", "C"] as DiscType[])
		.slice()
		.sort((a, b) => scores[b] - scores[a]);
	return `${sorted[0]}${sorted[1]}`;
}

export function getShareThumbnail(compositeType: string): string {
	return `${CDN_BASE}/share-${compositeType.toLowerCase()}.png`;
}
