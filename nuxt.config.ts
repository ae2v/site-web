import tailwindcss from "@tailwindcss/vite";
import svgLoader from "vite-svg-loader";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ["~/assets/css/main.css"],
	runtimeConfig: {
		jwtSecret: process.env.JWT_SECRET || "",
		jwtIssuer: process.env.JWT_ISSUER || "bde-velizy",
		jwtAudience: process.env.JWT_AUDIENCE || "bde-velizy-web",
		adminPassword: process.env.ADMIN_PASSWORD || "",
		public: {
			supabaseUrl: "",
			supabaseAnonKey: "",
		},
		private: {
			resendApiKey: process.env.RESEND_API_KEY || "",
			senderEmail: process.env.RESEND_SENDER_EMAIL || "",
		},
	},
	vite: {
		plugins: [tailwindcss(), svgLoader()],
	},
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
});
