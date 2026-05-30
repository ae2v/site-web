<script setup lang="ts">
type BtnStyle = "NEUTRAL" | "PRIMARY" | "LINK" | "SUCCESS" | "DANGER";

type BtnSize = "SMALL" | "MEDIUM" | "LARGE";

const props = defineProps<{
	label?: string;
	icon?: Component;
	btnStyle?: BtnStyle;
	btnSize?: BtnSize;
	handler: string | (() => void | Promise<void>);
	disabled?: boolean;
}>();

const sizeTextClasses: Record<BtnSize, string> = {
	SMALL: "text-sm",
	MEDIUM: "text-base",
	LARGE: "text-lg",
};

const sizeClasses: Record<BtnSize, string> = {
	SMALL: "h-10 rounded-xl",
	MEDIUM: "h-12 rounded-xl",
	LARGE: "h-16 rounded-full",
};

const sizeWidthClasses: Record<
	BtnSize,
	{ withIcon: string; labelOnly: string }
> = {
	SMALL: { withIcon: "pl-4 pr-3", labelOnly: "px-4" },
	MEDIUM: { withIcon: "pl-5 pr-4", labelOnly: "px-5" },
	LARGE: { withIcon: " pl-6 pr-5", labelOnly: "px-8" },
};

const iconSizeClasses: Record<
	BtnSize,
	{ withLabel: string; iconOnly: string }
> = {
	SMALL: { withLabel: "w-4 h-4", iconOnly: "w-5 h-5" },
	MEDIUM: { withLabel: "w-5 h-5", iconOnly: "w-6 h-6" },
	LARGE: { withLabel: "w-6 h-6", iconOnly: "w-7 h-7" },
};

const styleClasses: Record<BtnStyle, string> = {
	NEUTRAL:
		"bg-button text-button-text border border-button-border font-medium hover:bg-button-hover",
	PRIMARY:
		"bg-button-primary text-button-primary-text font-semibold hover:bg-button-primary-hover",
	LINK: "text-button-primary hover:underline",
	SUCCESS:
		"bg-button-success text-button-success-text font-semibold hover:bg-button-success-hover",
	DANGER: "bg-button-danger text-button-danger-text font-semibold hover:bg-button-danger-hover",
};

const isLoading = ref(false);

const handleClick = async () => {
	if (isLoading.value || props.disabled) return;
	if (typeof props.handler === "string") {
		if (props.handler.startsWith("/")) {
			await navigateTo(props.handler);
		} else {
			if (props.handler.startsWith("/")) {
				await navigateTo(props.handler);
			} else if (props.handler.startsWith("@:")) {
				window.open(props.handler.slice(2), "_blank");
			} else {
				window.open(props.handler);
			}
		}
		return;
	}

	isLoading.value = true;

	try {
		await props.handler();
	} finally {
		isLoading.value = false;
	}
};

const btnClass = computed(() => {
	const btnSize = props.btnSize ?? "MEDIUM";
	const btnStyle = props.btnStyle ?? "NEUTRAL";
	const isLinkStyle = btnStyle === "LINK";

	let base =
		"cursor-pointer select-none flex items-center justify-center gap-1.5 rounded-full transition-all duration-200";

	if (props.disabled || isLoading.value) {
		base += " opacity-60 cursor-not-allowed";
	}

	base += ` ${sizeTextClasses[btnSize]}`;

	if (!isLinkStyle) {
		base += ` ${sizeClasses[btnSize]}`;

		if (props.icon) {
			base += props.label
				? ` w-fit ${sizeWidthClasses[btnSize].withIcon}`
				: " w-11";
		} else {
			base += ` w-fit ${sizeWidthClasses[btnSize].labelOnly}`;
		}
	}

	return `${base} ${styleClasses[btnStyle]}`;
});

const iconClass = computed(() => {
	const btnSize = props.btnSize ?? "MEDIUM";
	return props.label
		? iconSizeClasses[btnSize].withLabel
		: iconSizeClasses[btnSize].iconOnly;
});
</script>

<template>
	<button
		:class="btnClass"
		@click="handleClick"
		:disabled="isLoading || props.disabled"
	>
		<span v-if="isLoading">Chargement...</span>
		<component
			v-else
			v-if="props.icon"
			:is="props.icon"
			:class="iconClass"
		/>
		<span v-if="props.label && !isLoading">{{ props.label }}</span>
	</button>
</template>
