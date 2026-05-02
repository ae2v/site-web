export interface Event {
	id: number;
	title: string;
	description: string;
	date: Date;
	endDate?: Date;
	location: string;
	photoUrl: string | null;
	link: string | null;
	linkLabel: string | null;
}
