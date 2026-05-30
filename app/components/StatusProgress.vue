<script setup lang="ts">
import {
	CheckCircleIcon,
	ClockIcon,
	ShoppingCartIcon,
	XMarkIcon,
	CreditCardIcon,
} from "@heroicons/vue/24/solid";
import type { OrderStatus } from "~~/shared/models/shop";

const props = defineProps<{
	progress: OrderStatus;
}>();

const stepsOrdered: OrderStatus[] = [
	"PENDING",
	"RESERVED",
	"READY",
	"COMPLETED",
];

const stepsLabels = {
	PENDING: "En attente",
	RESERVED: "Réservé",
	READY: "Prêt",
	CANCELED: "Annulé",
	COMPLETED: "Terminé",
};

const _style: Record<OrderStatus, string> = {
	PENDING: "bg-orange-500/25 text-orange-500",
	RESERVED: "bg-yellow-500/25 text-yellow-500",
	READY: "bg-blue-500/25 text-blue-500",
	CANCELED: "bg-red-500/25 text-red-500",
	COMPLETED: "bg-green-500/25 text-green-500",
};

const _stylePending: Record<OrderStatus, string> = {
	PENDING: "bg-gray-300/25 text-gray-300",
	RESERVED: "bg-gray-300/25 text-gray-300",
	READY: "bg-gray-300/25 text-gray-300",
	CANCELED: "bg-gray-300/25 text-gray-300",
	COMPLETED: "bg-gray-300/25 text-gray-300",
};

const stepIcons: Record<OrderStatus, Component> = {
	PENDING: ClockIcon,
	RESERVED: ShoppingCartIcon,
	READY: CreditCardIcon,
	CANCELED: XMarkIcon,
	COMPLETED: CheckCircleIcon,
};
</script>
<template>
	<div class="flex items-center gap-2 px-8">
		<template
			v-for="(step, index) in stepsOrdered"
			:key="step"
		>
			<div class="flex flex-col items-center">
				<div
					class="flex flex-col items-center rounded-full p-3"
					:class="
						stepsOrdered.indexOf(progress) >= index
							? 'bg-primary text-white'
							: 'bg-gray-300/25 text-gray-300'
					"
				>
					<component
						:is="stepIcons[step]"
						class="h-6 w-6"
					/>
				</div>
			</div>
			<div
				class="h-2 w-full rounded-full"
				v-if="index < stepsOrdered.length - 1"
				:class="
					(stepsOrdered.indexOf(progress) >= index
						? 'bg-primary text-white'
						: 'bg-gray-300/25 text-gray-300') +
					(stepsOrdered.indexOf(progress) == index
						? ' animate-pulse'
						: '')
				"
			></div>
		</template>
	</div>
</template>
