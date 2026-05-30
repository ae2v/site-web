export function toTitleCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/(?:^|\s|[-'])\p{L}/gu, (match) => match.toUpperCase());
}
