export type Department = "MMI" | "GEII" | "INFO" | "RT" | "MRIT";
export type Pole =
	| "DIRECTION"
	| "COMMUNICATION"
	| "DÉVELOPPEMENT"
	| "MARKETING"
	| "ÉVÉNEMENTIEL";

export type Role =
	| "Président"
	| "Vice-Président"
	| "Trésorier"
	| "Secrétaire"
	| "Membre";

export interface Member {
	id: number;
	firstName: string;
	lastName: string;
	pronouns: string | null;
	discord: string | null;
	pole: Pole;
	role: Role;
	department: Department;
	promo: number; // Année d'obtention du diplôme
	photoUrl: string | null;
}
