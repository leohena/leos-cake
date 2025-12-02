class BrevoEmailService {
    constructor() {
        // As propriedades relacionadas ao SendPulse foram removidas para eliminar segredos e código morto.
    }

    getLogoUrl() {
        return "https://raw.githubusercontent.com/leohena/leos-cake/master/images/logo-png.png";
    }

    async sendEmail({ to, subject, html }) {
        try {
            // A lógica agora delega o envio de e-mail para uma função serverless da Vercel,
            // que é a abordagem correta e segura para lidar com chaves de API.
            const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            const currentPort = window.location.port || "80";
            const functionUrl = isLocal
                ? `http://localhost:${currentPort}/api/send-email`
                : "/api/send-email";

            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to,
                    subject,
                    html
                })
            });

            if (!response.ok) {
                let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = `Erro ao enviar email: ${JSON.stringify(errorData)}`;
                } catch (e) {
                    console.warn("Não foi possível parsear resposta de erro");
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log("Email enviado com sucesso via função Vercel (Brevo):", result);
            return { success: true, data: result };
        } catch (error) {
            console.error("Erro ao enviar email via função Vercel:", error);
            return { success: false, error: error.message };
        }
    }

    stripHtml(html) {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    getEmailTemplate(status, order) {
        const isEnglish = order.idioma === "en";
        const templates = {
            "pendente": isEnglish ? this.templateRecebidoEN(order) : this.templateRecebido(order),
            "recebido": isEnglish ? this.templateRecebidoEN(order) : this.templateRecebido(order),
            "confirmado": isEnglish ? this.templateConfirmadoEN(order) : this.templateConfirmado(order),
            "producao": isEnglish ? this.templateProducaoEN(order) : this.templateProducao(order),
            "saiu_entrega": isEnglish ? this.templateSaiuEntregaEN(order) : this.templateSaiuEntrega(order),
            "entregue": isEnglish ? this.templateEntregueEN(order) : this.templateEntregue(order),
            "agradecimento": isEnglish ? this.templateAgradecimentoEN(order) : this.templateAgradecimento(order)
        };
        return templates[status] || this.templateRecebido(order);
    }

    getSubject(status, order) {
        const isEnglish = order.idioma === "en";
        const subjects = {
            "pendente": isEnglish ? "Order Received - Leo's Cake" : "Pedido Recebido - Leo's Cake",
            "recebido": isEnglish ? "Order Received - Leo's Cake" : "Pedido Recebido - Leo's Cake",
            "confirmado": isEnglish ? "Order Confirmed - Leo's Cake" : "Pedido Confirmado - Leo's Cake",
            "producao": isEnglish ? "Order in Production - Leo's Cake" : "Pedido em Produção - Leo's Cake",
            "saiu_entrega": isEnglish ? "Order Out for Delivery - Leo's Cake" : "Pedido Saiu para Entrega - Leo's Cake",
            "entregue": isEnglish ? "Order Delivered - Leo's Cake" : "Pedido Entregue - Leo's Cake",
            "agradecimento": isEnglish ? "Thank You - Leo's Cake" : "Obrigado - Leo's Cake"
        };
        return subjects[status] || "Pedido Recebido - Leo's Cake";
    }

    // Template básico para teste
    templateRecebido(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Recebido - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #ff6b9d, #ffa726); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Olá ${order.cliente_nome || 'Cliente'},</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Recebemos seu pedido com sucesso! Em breve entraremos em contato para confirmar os detalhes.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateConfirmado(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Confirmado - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Pedido Confirmado!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Olá ${order.cliente_nome || 'Cliente'}, seu pedido foi confirmado com sucesso!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Estamos preparando tudo com muito carinho para você. Em breve atualizaremos o status do seu pedido.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateProducao(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Em Produção - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Seu pedido está em produção!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Olá ${order.cliente_nome || 'Cliente'}, seu pedido está sendo preparado com muito carinho em nossa cozinha.
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Estamos colocando todo o nosso amor e dedicação para criar algo especial para você. Em breve atualizaremos o status quando estiver pronto para entrega.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateSaiuEntrega(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saiu para Entrega - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Seu pedido saiu para entrega!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Olá ${order.cliente_nome || 'Cliente'}, seu pedido acabou de sair da nossa cozinha e está a caminho!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Nossa equipe está levando até você com muito cuidado. Aguarde ansiosamente pela sua deliciosa surpresa!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateEntregue(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Entregue - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Pedido Entregue com Sucesso!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Olá ${order.cliente_nome || 'Cliente'}, seu pedido foi entregue com sucesso!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Esperamos que tenha gostado das nossas delícias. Obrigado por escolher a Leo's Cake!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateAgradecimento(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Obrigado - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #E91E63, #C2185B); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delícias feitas com muito amor</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Obrigado!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Olá ${order.cliente_nome || 'Cliente'}, muito obrigado por escolher a Leo's Cake!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Sua satisfação é a nossa maior recompensa. Esperamos vê-lo novamente em breve!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Data de Entrega:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    // Templates em inglês
    templateRecebidoEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Received - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #ff6b9d, #ffa726); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hello ${order.cliente_nome || 'Customer'},</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                We have received your order successfully! We will contact you soon to confirm the details.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateConfirmadoEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Order Confirmed!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello ${order.cliente_nome || 'Customer'}, your order has been confirmed successfully!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                We are preparing everything with great care for you. We will update your order status soon.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateProducaoEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>In Production - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Your order is in production!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello ${order.cliente_nome || 'Customer'}, your order is being prepared with great care in our kitchen.
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                We are putting all our love and dedication to create something special for you. We will update the status soon when it's ready for delivery.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateSaiuEntregaEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Out for Delivery - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Your order is out for delivery!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello ${order.cliente_nome || 'Customer'}, your order just left our kitchen and is on its way!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Our team is delivering it to you with great care. Look forward to your delicious surprise!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateEntregueEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Order Delivered Successfully!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello ${order.cliente_nome || 'Customer'}, your order has been delivered successfully!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                We hope you enjoyed our treats. Thank you for choosing Leo's Cake!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    templateAgradecimentoEN(order) {
        const itensHtml = this.formatOrderItems(order);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - Leo's Cake</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #E91E63, #C2185B); padding: 40px 20px; text-align: center;">
                            <div style="display: inline-block; border-radius: 50%; overflow: hidden; width: 200px; height: 200px; border: 4px solid #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                                <img src="${this.getLogoUrl()}" alt="Leo's Cake" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Delicious treats made with love</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Thank You!</h2>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello ${order.cliente_nome || 'Customer'}, thank you very much for choosing Leo's Cake!
                            </p>
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Your satisfaction is our greatest reward. We hope to see you again soon!
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Order Details #${order.numero_pedido || order.id}</h3>
                                ${itensHtml}
                                <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                                    <strong style="color: #333333;">Total: ${this.formatCurrency(order.valor_total || 0)}</strong>
                                </div>
                                ${order.data_entrega ? `<div style="margin-top: 10px; color: #666;"><strong>Delivery Date:</strong> ${this.formatDate(order.data_entrega)}</div>` : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    // Métodos auxiliares para formatação
    formatOrderItems(order) {
        if (!order.itens || order.itens.length === 0) {
            return '<p style="color: #666; font-style: italic;">Itens do pedido não disponíveis</p>';
        }

        return order.itens.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <strong>${item.produtos?.nome || 'Produto'}</strong>
                    <span style="color: #666; margin-left: 10px;">Qty: ${item.quantidade}</span>
                </div>
                <div style="font-weight: bold; color: #333;">
                    ${this.formatCurrency((item.quantidade || 0) * (item.preco_unitario || 0))}
                </div>
            </div>
        `).join('');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            // Parse date parts to avoid timezone issues
            const parts = dateString.split('T')[0].split('-');
            const date = new Date(parts[0], parts[1]-1, parts[2]);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    }
}

// Tornar a classe disponível globalmente
window.BrevoEmailService = BrevoEmailService;
console.log('✅ BrevoEmailService carregado e disponível em window.BrevoEmailService');
