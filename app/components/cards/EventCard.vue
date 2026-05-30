<script setup lang="ts">
import type { Event } from "~~/shared/models/events";

import {
	CalendarDateRangeIcon,
	CalendarIcon,
	MapPinIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{
	event: Event;
}>();
</script>
<template>
	<div class="flex bg-surface rounded-4xl shadow-2xl overflow-hidden">
		<img
			:src="event.photoUrl || '/default-photo.png'"
			:alt="`Photo de ${event.title}`"
			class="w-full aspect-[1/1.414] object-cover"
		/>
		<div class="flex flex-col justify-center gap-4 p-8">
			<div class="flex justify-left items-center gap-1">
				<h3 class="grow text-2xl font-semibold">
					{{ event.title }}
				</h3>
			</div>
			<p class="text-sm text-muted">
				{{ event.description }}
			</p>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-1">
					<MapPinIcon class="text-primary w-5 h-5" />
					<p class="text-sm text-muted">{{ event.location }}</p>
				</div>
				<div class="flex items-center gap-1">
					<CalendarDateRangeIcon class="text-primary w-5 h-5" />
					<p class="text-sm text-muted">
						{{
							new Date(event.date).toLocaleDateString("fr-FR", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})
						}}
					</p>
				</div>
			</div>
			<a
				:href="event.link || '#'"
				class="flex bg-primary text-white text-sm font-medium rounded-lg w-fit px-4 py-3"
			>
				{{ event.linkLabel || "En savoir plus" }}
			</a>
		</div>
	</div>
</template>
