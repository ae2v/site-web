<script setup lang="ts">
import type { ShopItem } from "#shared/models/shop";
import { ShoppingCartIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
	item: ShopItem;
}>();
</script>
<template>
	<div
		class="cursor-pointer flex flex-col rounded-4xl shadow-2xl overflow-hidden"
		@click="() => navigateTo(`/shop/products/${item.id}`)"
	>
		<img
			:src="item.variants[0]?.photoUrl || '/default-photo.png'"
			:alt="`Photo de ${item.name}`"
			class="w-full aspect-5/4 object-cover"
		/>
		<div class="flex flex-col gap-1 bg-background p-8">
			<div class="flex justify-left items-center gap-1">
				<h3 class="grow text-xl font-semibold">
					{{ item.name }}
				</h3>
				<span
					class="bg-primary/15 text-primary text-sm font-medium px-4 py-1.5 rounded-full"
				>
					{{ item.category }}
				</span>
			</div>
			<div class="flex gap-1">
				<div class="flex items-end gap-1">
					<p class="text-emerald-500 text-3xl font-bold">
						{{ item.price / 100 }}€
					</p>
					<p class="text-muted line-through text-xl font-medium">
						{{ item.price / 100 }}€
					</p>
				</div>
			</div>
			<div class="flex justify-start gap-4 mt-4">
				<Button
					:handler="`/shop/order/new?id=${item.id}`"
					:icon="ShoppingCartIcon"
					label="Commander"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
				/>
				<Button
					:handler="`/shop/products/${item.id}`"
					label="Voir le produit"
					btnStyle="LINK"
					btnSize="MEDIUM"
				/>
			</div>
		</div>
	</div>
</template>
