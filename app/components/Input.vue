<script setup lang="ts">
import {
	EyeIcon,
	EyeSlashIcon,
	MinusIcon,
	PlusIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{
	label?: string;
	name?: string;
	placeholder?: string;
	modelValue?: string | number;
	type?: string;
	icon?: Component;
	required?: boolean;
	min?: number;
	max?: number;
	hideControls?: boolean;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string | number];
}>();

const handleInput = (e: Event) => {
	const val = (e.target as HTMLInputElement).value;

	if ((props.type as string) === "number") {
		// preserve empty string so parent can decide how to handle it
		emit("update:modelValue", val === "" ? "" : Number(val));
	} else {
		emit("update:modelValue", val);
	}
};

const showPassword = ref(false);
</script>
<template>
	<div class="flex-1 flex flex-col gap-0.5">
		<label v-if="label" :for="name" class="text-sm font-medium px-5">
			{{ label }}
			<span v-if="required" class="text-primary">*</span>
			<span v-else class="text-muted">(optionnel)</span>
		</label>
		<div
			class="flex items-center gap-2 bg-input text-input-text rounded-xl px-5 py-4"
		>
			<component v-if="icon" :is="icon" class="w-5 h-5 text-muted" />
			<MinusIcon
				v-if="type === 'number' && !hideControls"
				class="w-5 h-5 text-muted"
				@click="
					() => {
						if (Number(modelValue) > (min || 0))
							$emit(
								'update:modelValue',
								Number(Number(modelValue) - 1),
							);
					}
				"
				:disabled="Number(modelValue) <= (min || 0)"
			/>
			<input
				:value="modelValue"
				:type="
					type === 'password'
						? showPassword
							? 'text'
							: 'password'
						: type || 'text'
				"
				:name="name"
				:placeholder="placeholder"
				:required="required"
				:min="min"
				:max="max"
				class="flex-1 focus:outline-none"
				@input="handleInput"
			/>
			<PlusIcon
				v-if="type === 'number' && !hideControls"
				class="w-5 h-5 text-muted"
				@click="
					() => {
						if (Number(modelValue) < (max || Infinity))
							$emit(
								'update:modelValue',
								Number(Number(modelValue) + 1),
							);
					}
				"
				:disabled="Number(modelValue) >= (max || Infinity)"
			/>
			<EyeIcon
				v-if="type === 'password' && !showPassword"
				@click="() => (showPassword = true)"
				class="w-6 h-6 text-muted cursor-pointer"
			/>
			<EyeSlashIcon
				v-if="type === 'password' && showPassword"
				@click="() => (showPassword = false)"
				class="w-6 h-6 text-muted cursor-pointer"
			/>
		</div>
	</div>
</template>
