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
			apiBase: "https://nuxr3.zeabur.app",
		},
	},
});
