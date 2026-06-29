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
	ArrowRightStartOnRectangleIcon,
	ShoppingCartIcon,
	UserIcon,
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
		<ul class="flex items-center gap-10 bg-primary text-white text-lg font-medium outline-8 outline-primary/40 rounded-3xl h-20 w-full px-8">
			<RouterLink to="/">
				<Logo
					class="text-white w-auto h-10"
				/>
			</RouterLink>
			<RouterLink
				to="/members"
				class="navlink hover:decoration-primary"
				"
				>Membres</RouterLink
			>
			<RouterLink
				to="/events"
				class="navlink hover:decoration-primary"
				>Événements</RouterLink
			>
			<RouterLink
				to="/shop"
				class="navlink hover:decoration-primary"
				>Boutique</RouterLink
			>

			<div class="grow"></div>

			<template v-if="user">
				<Button
					handler="/dashboard"
					:label="user.account?.firstName + ' ' + user.account?.lastName"
					btnStyle="LINK"
					btnSize="MEDIUM"
					:icon="UserIcon"
				/>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-5 h-5" />
				</RouterLink>
			</template>

			<template v-else>
				<RouterLink to="/auth/login" class="btn btn-sm">
					<UserIcon class="w-8 h-8" />
				</RouterLink>
				<RouterLink to="/shop/order" class="btn btn-sm">
					<ShoppingCartIcon class="w-8 h-8" />
				</RouterLink>
			</template>
		</ul>
	</nav>
</template>
