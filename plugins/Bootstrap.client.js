import Collapse from "bootstrap/js/dist/collapse";
import Dropdown from "bootstrap/js/dist/dropdown";
import Modal from "bootstrap/js/dist/modal";
import Tooltip from "bootstrap/js/dist/tooltip";
import Popover from "bootstrap/js/dist/popover";

export default defineNuxtPlugin((nuxtApp) => {
	// 可以在這裡添加全局初始化
	nuxtApp.hook("app:mounted", () => {
		// 例如自動初始化所有 tooltips
		const tooltipTriggerList = document.querySelectorAll(
			'[data-bs-toggle="tooltip"]',
		);
		const tooltipList = [...tooltipTriggerList].map(
			(tooltipTriggerEl) => new Tooltip(tooltipTriggerEl),
		);
	});

	return {
		provide: {
			bootstrap: {
				Collapse,
				Dropdown,
				Modal,
				Tooltip,
				Popover,
			},
		},
	};
});
