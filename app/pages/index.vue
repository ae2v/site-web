<script setup lang="ts">
import Navbar from "~/components/layout/Navbar.vue";
import Button from "~/components/Button.vue";

import EventCard from "~/components/cards/EventCard.vue";

import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/vue/20/solid";

import InstagramIcon from "~/assets/social/instagram.svg";
import GithubIcon from "~/assets/social/github.svg";
import SnapchatIcon from "~/assets/social/snapchat.svg";
import LinkedInIcon from "~/assets/social/linkedin.svg";
import FacebookIcon from "~/assets/social/facebook.svg";
import DiscordIcon from "~/assets/social/discord.svg";

import { ref } from "vue";
import { useInView } from "motion-v";
import { EnvelopeIcon } from "@heroicons/vue/24/outline";

const { events } = useEvents();

const title = "BDE de Vélizy";
const description =
	"Découvrez nos événements, nos projets et notre équipe. Rejoignez-nous pour vivre une expérience étudiante inoubliable !";
const url = "https://ae2v.ejnalo.me"; // https://bde-velizy.fr/
const image = "/hero_bde.jpg";

useSeoMeta({
	// SEO
	title,
	description,
	robots: "index, follow",

	// Open Graph
	ogTitle: title,
	ogDescription: description,
	ogType: "website",
	ogUrl: url,
	ogImage: image,
	ogSiteName: "BDE de Vélizy",
	ogLocale: "fr_FR",

	// Twitter
	twitterCard: "summary_large_image",
	twitterTitle: title,
	twitterDescription: description,
	twitterImage: image,
});

useHead({
	htmlAttrs: {
		lang: "fr",
	},
	bodyAttrs: {
		class: "bg-[url('/hero_bde.jpg')] bg-cover bg-center bg-no-repeat bg-fixed",
	},
	link: [
		{
			rel: "canonical",
			href: url,
		},
		{
			rel: "icon",
			href: "/favicon.ico",
		},
	],
	meta: [
		{
			name: "theme-color",
			content: "#de0a2d",
		},
	],
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
			<div class="text-center">
				<p class="text-xl">
					Nous sommes situés à l'Université de Vélizy, dans le
					département des Yvelines (78), en France. Venez nous rendre
					visite pour découvrir nos projets et événements !
				</p>
			</div>
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
			<div class="text-center">
				<p class="text-xl">
					Vous pouvez aussi nous trouver sur les réseaux sociaux
				</p>
				<div class="flex justify-center gap-4 mt-4">
					<a
						href="https://www.instagram.com/bde.velizy"
						target="_blank"
						rel="noopener noreferrer"
					>
						<InstagramIcon class="w-8 h-8" />
					</a>

					<a
						href="https://story.snapchat.com/s/bde.velizy"
						target="_blank"
						rel="noopener noreferrer"
					>
						<SnapchatIcon class="w-8 h-8" />
					</a>

					<a
						href="/go/discord"
						target="_blank"
						rel="noopener noreferrer"
					>
						<DiscordIcon class="w-8 h-8" />
					</a>

					<a
						href="https://www.facebook.com/Ae2velizy"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FacebookIcon class="w-8 h-8" />
					</a>

					<a
						href="https://www.linkedin.com/company/bde-velizy/"
						target="_blank"
						rel="noopener noreferrer"
					>
						<LinkedInIcon class="w-8 h-8" />
					</a>

					<a
						href="https://github.com/AE2V"
						target="_blank"
						rel="noopener noreferrer"
					>
						<GithubIcon class="w-8 h-8" />
					</a>

					<a
						href="mailto:ae2v.asso@gmail.com"
						target="_blank"
						rel="noopener noreferrer"
					>
						<EnvelopeIcon class="w-8 h-8" />
					</a>
				</div>
			</div>
		</section>
	</main>
</template>
