<script setup lang="ts">
const props = defineProps<{
	modelValue?: string | number;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string | number];
}>();

const handleChange = (event: Event) => {
	emit("update:modelValue", (event.target as HTMLSelectElement).value);
};
</script>

<template>
	<select
		class="w-full rounded-xl px-4 py-2"
		:value="props.modelValue"
		@change="handleChange"
	>
		<slot />
	</select>
</template>
