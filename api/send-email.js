// Vercel API Route para envio de emails via Brevo
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail(to, subject, html) {
	try {
		const response = await fetch(EMAIL_URL, {
			method: 'POST',
			headers: {
				'api-key': BREVO_API_KEY,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sender: {
					name: "Leo's Cake",
					email: 'leoscakegta@gmail.com'
				},
				to: [
					{
						email: to
					}
				],
				subject: subject,
				htmlContent: html
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Erro ao enviar email: ${JSON.stringify(errorData)}`);
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Erro ao enviar email:', error);
		return { success: false, error: error.message };
	}
}

export default async function handler(req, res) {
	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { to, subject, html } = req.body;

		// Validação
		if (!to || !subject || !html) {
			return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(to)) {
			return res.status(400).json({ error: 'Invalid email address' });
		}

		// Sanitizar
		const sanitizedSubject = subject.replace(/<script[^>]*>.*?<\/script>/gi, '');
		const sanitizedHtml = html.replace(/<script[^>]*>.*?<\/script>/gi, '');

		const result = await sendEmail(to, sanitizedSubject, sanitizedHtml);

		if (result.success) {
			return res.status(200).json(result);
		} else {
			return res.status(500).json(result);
		}
	} catch (error) {
		console.error('Erro no handler:', error);
		return res.status(500).json({ success: false, error: error.message });
	}
}
