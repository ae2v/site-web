const links: Record<string, string> = {
	discord: "https://discord.gg/8Z2g6v7",
	instagram: "https://www.instagram.com/bde.velizy/",
	github: "https://github.com/ae2v",
};

export default defineEventHandler((event) => {
	const { link } = event.context.params as { link: string };

	if (!Object.keys(links).includes(link)) {
		throw createError({
			statusCode: 404,
			message: "Le lien n'existe pas",
		});
	}

	return sendRedirect(event, links[link]!, 302);
});
