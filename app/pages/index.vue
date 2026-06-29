<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";

import EventCard from "~/components/cards/EventCard.vue";

import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/vue/20/solid";

import { ref } from "vue";
import { useInView } from "motion-v";

const { events } = useEvents();

useHead({
	title: "BDE de Vélizy",
	meta: [
		{
			name: "title",
			content: "BDE de Vélizy",
		},
		{
			property: "og:title",
			content: "BDE de Vélizy",
		}
	],
	bodyAttrs: {
		class: "bg-[url('/hero_bde.jpg')] bg-cover bg-center bg-no-repeat bg-fixed",
	},
});

const headerRef = ref<HTMLElement | null>(null);
const isHeaderVisible = useInView(headerRef, {
	margin: "-96px 0px 0px 0px",
});
</script>
<template>
	<Navbar :isTransparent="isHeaderVisible" :isFixed="true" />
	<header
		ref="headerRef"
		class="flex flex-col items-center justify-center gap-8 bg-black/30 text-white h-screen"
	>
		<h1 class="text-7xl font-bold font-display text-center">
			BDE de Vélizy
		</h1>
		<p class="text-xl text-center max-w-2xl">
			Découvrez nos événements, nos projets et notre équipe.
			Rejoignez-nous pour vivre une expérience étudiante inoubliable !
		</p>
		<Button
			btnStyle="PRIMARY"
			:handler="'/go/discord'"
			label="Rejoindre Discord"
			btnSize="LARGE"
			:icon="ChatBubbleOvalLeftEllipsisIcon"
		/>
	</header>
	<main class="bg-background min-h-screen">
		<section class="py-16 px-8" v-if="events.length > 0">
			<h2 class="text-4xl font-bold font-title text-center mb-8">
				Nos événements à venir
			</h2>
			<div
				class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				<EventCard
					v-for="event in events"
					:key="event.id"
					:event="event"
				/>
			</div>
		</section>
		<section class="py-16 px-8 space-y-8">
			<h2 class="text-4xl font-bold font-title text-center">
				Où sommes-nous ?
			</h2>
			<div class="flex flex-col items-center gap-4 max-w-4xl mx-auto">
				<iframe
					src="https://www.google.com/maps?q=48.78247159481812, 2.2176058243779475&hl=fr&z=15&output=embed"
					class="rounded-3xl w-full aspect-video"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
				/>

				<Button
					handler="https://www.google.com/maps?q=48.78247159481812, 2.2176058243779475&hl=fr&z=15&output=embed"
					label="Voir sur Google Maps"
					btnStyle="PRIMARY"
					btnSize="MEDIUM"
				/>
			</div>
		</section>
	</main>
</template>
