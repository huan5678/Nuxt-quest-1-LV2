import { defineStore } from "pinia";
import type { CreateOrderProps, UserData } from "~/types";

export const useOrdersStore = defineStore("orders", () => {
  const order = ref({} as CreateOrderProps);

  const createOrderToStore = (data: CreateOrderProps) => {
    order.value = data;
  }

  const resetOrder = () => {
    order.value = {} as CreateOrderProps;
  }

  return { order, createOrderToStore, resetOrder };
});

export const userUserStore = defineStore("user", () => {
		const user = ref({} as UserData);

		const setUser = (data: UserData) => {
			user.value = data;
		};

		return { user, setUser };
	});
