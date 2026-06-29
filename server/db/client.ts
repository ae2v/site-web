import { getDb } from "./connection";

export function useDb() {
	return getDb();
}
