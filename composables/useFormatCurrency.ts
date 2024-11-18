export const useFormatCurrency = () => {
	const formatCurrency = (number: number) => {
		return new Intl.NumberFormat("zh-TW", {
			style: "decimal",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(number);
	};

	return {
		formatCurrency,
	};
};
