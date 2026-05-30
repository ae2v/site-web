<script setup lang="ts">
import type { ItemVariant } from "#shared/models/shop";
import { ShoppingCartIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
	variant: ItemVariant;
	selected?: boolean;
}>();
</script>
<template>
	<div
		class="cursor-pointer flex flex-col rounded-4xl shadow-2xl overflow-hidden"
	>
		<img
			:src="variant.photoUrl || '/default-photo.png'"
			:alt="`Photo de ${variant.name}`"
			class="w-full aspect-5/4 object-cover"
		/>
		<div class="flex flex-col gap-1 bg-background p-8">
			<div class="flex justify-left items-center gap-1">
				<h3 class="grow text-xl font-semibold">
					{{ variant.name }}
				</h3>
				<span
					v-if="selected"
					class="bg-primary/15 text-primary text-sm font-medium px-4 py-1.5 rounded-full"
				>
					Sélectionnée
				</span>
			</div>
			<div class="flex gap-1">
				<div class="flex items-end gap-1">
					<p class="text-sm text-muted font-medium">
						Stock: {{ variant.stock }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
