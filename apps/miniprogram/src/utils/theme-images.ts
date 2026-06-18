const CDN_BASE =
	"https://7072-prod-d1gj2nkrx05fb1c16-1444533815.tcb.qcloud.la/static-images";

export const CDN_IMAGES = {
	benefits: `${CDN_BASE}/benefits.png`,
	adviceMeeting: `${CDN_BASE}/advice-meeting.png`,
	imageryLeft: `${CDN_BASE}/imagery-left.png`,
	imageryRight: `${CDN_BASE}/imagery-right.png`,
	themeLeadership: `${CDN_BASE}/theme-leadership.png`,
	themeProfessional: `${CDN_BASE}/theme-professional.png`,
	themeRelationship: `${CDN_BASE}/theme-relationship.png`,
};

export function getThemeHeroImage(themeId: string | undefined): string {
	switch (themeId) {
		case "professional":
			return CDN_IMAGES.themeProfessional;
		case "relationship":
			return CDN_IMAGES.themeRelationship;
		case "leadership":
			return CDN_IMAGES.themeLeadership;
		default:
			return CDN_IMAGES.themeProfessional;
	}
}
