import type { Department } from "../models/member";

const deptColors: Record<
	Department,
	Record<"normal" | "light" | "lighter" | "faded", string>
> = {
	MMI: {
		normal: "#54137a",
		light: "#771bad",
		lighter: "#a137e0",
		faded: "#c17bea",
	},
	GEII: {
		normal: "#074b94",
		light: "#0a67cc",
		lighter: "#308ef5",
		faded: "#7ab7f9",
	},
	INFO: {
		normal: "#874211",
		light: "#bb5b18",
		lighter: "#e6823b",
		faded: "#efae80",
	},
	RT: {
		normal: "#0a8610",
		light: "#0ebd16",
		lighter: "#29f033",
		faded: "#72f579",
	},
	MRIT: {
		normal: "#008d7b",
		light: "#00c8ae",
		lighter: "#17ffe1",
		faded: "#66ffeb",
	},
};

export default deptColors;
