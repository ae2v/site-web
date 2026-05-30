export type MembershipStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "REVOKED" | "VISITOR";

export interface Account {
	id: number;
	firstName: string;
	lastName: string;
	studentId: string | null;
	email: string;
	passwordHash: string | null;
	membershipStatus: MembershipStatus;
}
