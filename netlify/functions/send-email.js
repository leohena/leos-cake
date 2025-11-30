const BREVO_API_KEY = process.env.BREVO_API_KEY; // Chave API do Brevo via variável de ambiente
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

exports.handler = async (event) => {
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Methods': 'POST, OPTIONS'
			},
			body: ''
		};
	}

	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify({ error: 'Method not allowed' })
		};
	}

	try {
		const { to, subject, html } = JSON.parse(event.body);

		// Validação e sanitização
		if (!to || !subject || !html) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Missing required fields: to, subject, html' })
			};
		}

		// Validar email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(to)) {
			return {
				statusCode: 400,
				body: JSON.stringify({ error: 'Invalid email address' })
			};
		}

		// Sanitizar subject e html (remover scripts)
		const sanitizedSubject = subject.replace(/<script[^>]*>.*?<\/script>/gi, '');
		const sanitizedHtml = html.replace(/<script[^>]*>.*?<\/script>/gi, '');

		const result = await sendEmail(to, sanitizedSubject, sanitizedHtml);

		return {
			statusCode: result.success ? 200 : 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Methods': 'POST, OPTIONS'
			},
			body: JSON.stringify(result)
		};
	} catch (error) {
		console.error('Erro no handler:', error);
		return {
			statusCode: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			},
			body: JSON.stringify({ success: false, error: error.message })
		};
	}
};
