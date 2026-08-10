<script setup lang="ts">
import { useAuth } from "~~/app/composables/useAuth";

import Logo from "~/assets/logo.svg";
import { ShoppingCartIcon, UserIcon } from "@heroicons/vue/24/outline";

const { user, logout } = useAuth();

const doLogout = async () => {
	await logout();
};
</script>
<template>
	<nav
		id="navbar"
		class="fixed bg-primary text-white z-50 top-0 left-0 right-0 transition-all duration-100"
	>
		<ul
			class="container flex items-center gap-6 bg-primary text-white text-lg font-medium h-24 w-full px-8 mx-auto"
		>
			<RouterLink to="/">
				<Logo class="text-white w-auto h-10" />
			</RouterLink>
			<RouterLink
				to="/bde"
				class="navlink flex flex-col group"
			>
				<span class="uppercase font-extrabold">Le BDE</span>
				<div
					class="bg-secondary h-1 w-0 transition-all group-hover:w-full"
				></div>
			</RouterLink>
			<RouterLink
				to="/events"
				class="navlink flex flex-col group"
			>
				<span class="uppercase font-extrabold">Événements</span>
				<div
					class="bg-secondary h-1 w-0 transition-all group-hover:w-full"
				></div>
			</RouterLink>
			<RouterLink
				to="/shop"
				class="navlink flex flex-col group"
			>
				<span class="uppercase font-extrabold">Boutique</span>
				<div
					class="bg-secondary h-1 w-0 transition-all group-hover:w-full"
				></div>
			</RouterLink>

			<div class="grow"></div>

			<template v-if="user">
				<RouterLink
					to="/dashboard"
					class="btn btn-sm flex items-center gap-2"
				>
					<UserIcon class="w-6 h-6" />
					<span class="max-md:hidden">
						{{
							user.account?.firstName +
							" " +
							user.account?.lastName
						}}
					</span>
				</RouterLink>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-6 h-6" />
				</RouterLink>
			</template>

			<template v-else>
				<RouterLink to="/auth/login" class="btn btn-sm">
					<UserIcon class="w-6 h-6" />
				</RouterLink>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-6 h-6" />
				</RouterLink>
			</template>
		</ul>
	</nav>
</template>
