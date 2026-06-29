<style scoped>
.navlink {
	@apply underline decoration-3 underline-offset-4 transition-colors duration-150;
}

.navlink:not(:hover) {
	@apply decoration-transparent;
}
</style>
<script setup lang="ts">
import { useAuth } from "~~/app/composables/useAuth";

import Logo from "~/assets/logo.svg";
import {
	ShoppingCartIcon,
	UserIcon,
	CalendarDaysIcon,
	UsersIcon,
	ShoppingBagIcon
} from "@heroicons/vue/24/outline";

const { user, logout } = useAuth();

const doLogout = async () => {
	await logout();
};
</script>
<template>
	<nav
		id="navbar"
		class="fixed z-50 top-0 left-0 right-0 p-4 transition-all duration-200"
	>
		<ul
			class="container flex items-center gap-6 bg-primary text-white text-lg font-medium outline-8 outline-primary/40 rounded-3xl h-20 w-full px-8 mx-auto"
		>
			<RouterLink to="/">
				<Logo class="text-white w-auto h-10" />
			</RouterLink>
			<RouterLink
				to="/members"
				class="navlink flex items-center gap-2 hover:decoration-primary"
			>
				<UsersIcon class="w-6 h-6 inline-block" />
				<span class="max-md:hidden">Membres</span>
			</RouterLink>
			<RouterLink
				to="/events"
				class="navlink flex items-center gap-2 hover:decoration-primary"
			>
				<CalendarDaysIcon class="w-6 h-6 inline-block" />
				<span class="max-md:hidden">Événements</span>
			</RouterLink>
			<RouterLink to="/shop" class="navlink flex items-center gap-2 hover:decoration-primary">
				<ShoppingBagIcon class="w-6 h-6 inline-block" />
				<span class="max-md:hidden">Boutique</span>
			</RouterLink>

			<div class="grow"></div>

			<template v-if="user">
				<RouterLink
					to="/dashboard"
					class="btn btn-sm flex items-center gap-2"
				>
					<UserIcon class="w-6 h-6" />
					<span class="max-md:hidden">
						{{ user.account?.firstName + " " + user.account?.lastName }}
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
