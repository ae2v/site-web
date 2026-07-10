import { Resend } from "resend";
import { ItemVariant, Order } from "#shared/models/shop";

const { resendApiKey, senderEmail } = useRuntimeConfig().private;

const resend = new Resend(resendApiKey);

export const sendCommandConfirmationEmail = async (
	o: Order,
	product: ItemVariant,
) => {
	const response = await resend.emails.send({
		from: senderEmail,
		to: [o.customerEmail],
		subject: "BDE de Vélizy - Commande n°" + o.orderCode + " confirmée",
		html: `
		<p>Bonjour ${o.customerFirstName},</p>
		<p>
			Votre commande a bien été enregistrée et sera traitée dans les plus brefs délais.<br>
		<p>
			<b>Code de commande:</b> ${o.orderCode} (à utiliser avec cette adresse email)<br/>
			<b>Produit:</b> ${product.name} (x${o.quantity})<br/>
		</p>
		<p>Merci pour votre confiance et à bientôt !</p>
		<p>L'équipe du BDE de Vélizy</p>
		`,
	});

	if (response.error) {
		throw createError({
			statusCode: 500,
			message: "Error sending email",
		});
	}

	return response;
};

export const sendCommandClaimEmail = async (
	o: Order,
	product: ItemVariant,
) => {
	const response = await resend.emails.send({
		from: senderEmail,
		to: [o.customerEmail],
		subject: "BDE de Vélizy - Commande n°" + o.orderCode + " associée à votre compte",
		html: `
		<p>Bonjour ${o.customerFirstName},</p>
		<p>
			Une commande a été associée à votre compte.<br>
		</p>
		<p>
			<b>Code de commande:</b> ${o.orderCode} (à utiliser avec cette adresse email)<br/>
			<b>Produit:</b> ${product.name} (x${o.quantity})<br/>
		</p>
		<p>Merci pour votre confiance et à bientôt !</p>
		<p>L'équipe du BDE de Vélizy</p>
		`,
	});

	if (response.error) {
		throw createError({
			statusCode: 500,
			message: "Error sending email",
		});
	}

	return response;
};
