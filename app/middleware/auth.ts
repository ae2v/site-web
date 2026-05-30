export default defineNuxtRouteMiddleware(async (to, from) => {
	// Skip on server side
	if (process.server) {
		return;
	}

	const { user, fetchMe } = useAuth();

	// Fetch current user if not already loaded
	if (!user.value) {
		try {
			await fetchMe();
		} catch (error) {
			console.error("Auth fetch failed:", error);
		}
	}

	// Redirect to login if not authenticated after fetch attempt
	if (!user.value) {
		return navigateTo("/auth/login");
	}
});
