import leadershipHero from "../assets/images/theme-leadership.png";
import professionalHero from "../assets/images/theme-professional.png";
import relationshipHero from "../assets/images/theme-relationship.png";

export function getThemeHeroImage(themeId: string): string {
	switch (themeId) {
		case "professional":
			return professionalHero;
		case "relationship":
			return relationshipHero;
		case "leadership":
			return leadershipHero;
		default:
			return professionalHero;
	}
}
