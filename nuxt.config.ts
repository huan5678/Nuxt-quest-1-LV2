// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	css: ["@/assets/styles/all.scss"],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					quietDeps: true,
				},
			},
		},
	},
	runtimeConfig: {
		public: {
			apiBase: process.env.NUXT_PUBLIC_API_BASE || "https://nuxr3.zeabur.app",
			apiPath: process.env.NUXT_PUBLIC_API_PATH || "/api/v1",
		},
	},
	modules: ["@pinia/nuxt"],
  plugins: ["@/plugins/auth.ts"],
	typescript: {
		tsConfig: {
			include: ["./types/*.ts"],
		},
	},
});
