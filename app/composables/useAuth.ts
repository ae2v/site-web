export const useAuth = () => {
	const user = useState<Record<string, any> | null>("authUser", () => null);
	const error = useState<{ statusCode?: number; message: string } | null>(
		"authError",
		() => null,
	);

	const login = async (payload: Record<string, any>) => {
		try {
			await $fetch("/api/auth/login", {
				method: "POST",
				body: payload,
			});

			return await fetchMe();
		} catch (err) {
			error.value = err as Error;
			user.value = null;
			return null;
		}
	};

	const signup = async (payload: Record<string, any>) => {
		try {
			const res = await $fetch<{ user?: Record<string, any> }>(
				"/api/auth/signup",
				{
					method: "POST",
					body: payload,
				},
			);

			await fetchMe();

			return res.user ?? null;
		} catch (err) {
			error.value = err as Error;
			user.value = null;
			return null;
		}
	};

	const fetchMe = async () => {
		try {
			const res = await $fetch<{ user: Record<string, any> }>(
				"/api/auth/me",
			);

			user.value = res.user;
			error.value = null;
			return user.value;
		} catch (err) {
			user.value = null;
			return null;
		}
	};

	const logout = async () => {
		try {
			await $fetch("/api/auth/logout", { method: "POST" });
		} finally {
			user.value = null;
		}
	};

	if (process.client) fetchMe().catch(() => {});

	return {
		user,
		error,
		login,
		signup,
		logout,
		fetchMe,
	};
};
