// Sistema de Recibos e Emails - Leo's Cake
class ReceiptSystem {
    constructor(emailConfig = null) {
        this.emailConfig = emailConfig || {
            serviceId: '',
            templateId: '',
            userId: ''
        };
        // Informações da empresa serão carregadas do banco
        this.companyInfo = {
            name: 'Leo\'s Cake',
            email: 'contato@leoscake.com',
            phone: '(11) 99999-9999',
            address: 'São Paulo, SP'
        };
        
        // Carregar configurações na inicialização (aguarda DataManager estar disponível)
        this.initializeConfigurations();
    }
    
    async initializeConfigurations() {
        // Aguardar DataManager estar disponível
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!window.dataManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (window.dataManager) {
            await this.loadConfigurations();
        } else {
            console.warn('⚠️ DataManager não disponível, usando configurações padrão');
        }
    }
    
    async loadConfigurations() {
        try {
            const config = await window.dataManager.getConfiguracoes();
            
            // Configurações de email (só atualizar se não foram passadas no construtor)
            if (!this.emailConfig.serviceId) {
                this.emailConfig.serviceId = config.email_service_id || '';
            }
            if (!this.emailConfig.templateId) {
                this.emailConfig.templateId = config.email_template_id || '';
            }
            if (!this.emailConfig.userId) {
                this.emailConfig.userId = config.email_user_id || '';
            }
            
            // Configurações da empresa
            this.companyInfo = {
                name: config.empresa_nome || 'Leo\'s Cake',
                email: config.empresa_email || 'contato@leoscake.com',
                phone: config.empresa_telefone || '(11) 99999-9999',
                address: config.empresa_endereco || 'São Paulo, SP'
            };
            
            if (this.emailConfig.userId) {
                emailjs.init(this.emailConfig.userId);
            }
            
            console.log('✅ Configurações carregadas:', {
                empresa: this.companyInfo,
                email: { ...this.emailConfig, userId: this.emailConfig.userId ? '***' : 'não configurado' }
            });
            
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            // Manter valores padrão em caso de erro
        }
    }
    
    async loadEmailConfig() {
        // Método mantido para compatibilidade, mas agora chama loadConfigurations
        await this.loadConfigurations();
    }
    
    generateReceiptPDF(pedido, cliente, itens) {
        return new Promise((resolve, reject) => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Configurações
                const pageWidth = doc.internal.pageSize.width;
                const margin = 20;
                let currentY = 30;
                
                // Cabeçalho da empresa
                doc.setFontSize(20);
                doc.setFont(undefined, 'bold');
                doc.text(this.companyInfo.name, margin, currentY);
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                currentY += 8;
                doc.text(this.companyInfo.phone, margin, currentY);
                currentY += 6;
                doc.text(this.companyInfo.email, margin, currentY);
                
                // Data atual
                doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 60, 30);
                
                // Título do recibo
                currentY += 20;
                doc.setFontSize(16);
                doc.setFont(undefined, 'bold');
                const receiptTitle = window.i18n.t('receipt').toUpperCase();
                doc.text(receiptTitle, margin, currentY);
                
                // Número do pedido
                currentY += 10;
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');
                doc.text(`${window.i18n.t('order_number')}: ${pedido.numero_pedido}`, margin, currentY);
                
                // Dados do cliente
                currentY += 15;
                doc.setFont(undefined, 'bold');
                doc.text('CLIENTE:', margin, currentY);
                doc.setFont(undefined, 'normal');
                
                currentY += 8;
                doc.text(`Nome: ${cliente.nome}`, margin, currentY);
                
                if (cliente.telefone) {
                    currentY += 6;
                    doc.text(`Telefone: ${cliente.telefone}`, margin, currentY);
                }
                
                if (cliente.email) {
                    currentY += 6;
                    doc.text(`Email: ${cliente.email}`, margin, currentY);
                }
                
                // Data de entrega
                currentY += 15;
                doc.setFont(undefined, 'bold');
                doc.text('ENTREGA:', margin, currentY);
                doc.setFont(undefined, 'normal');
                
                currentY += 8;
                const dataEntrega = new Date(pedido.data_entrega).toLocaleDateString('pt-BR');
                doc.text(`Data: ${dataEntrega}`, margin, currentY);
                
                if (pedido.hora_entrega) {
                    doc.text(`Horário: ${pedido.hora_entrega}`, margin + 80, currentY);
                }
                
                // Itens do pedido
                currentY += 20;
                doc.setFont(undefined, 'bold');
                doc.text('ITENS DO PEDIDO:', margin, currentY);
                
                // Cabeçalho da tabela
                currentY += 10;
                doc.setFont(undefined, 'bold');
                doc.text('Item', margin, currentY);
                doc.text('Qtd', margin + 100, currentY);
                doc.text('Preço Unit.', margin + 130, currentY);
                doc.text('Subtotal', margin + 170, currentY);
                
                // Linha separadora
                currentY += 3;
                doc.line(margin, currentY, pageWidth - margin, currentY);
                
                // Itens
                currentY += 8;
                doc.setFont(undefined, 'normal');
                let totalGeral = 0;
                
                itens.forEach(item => {
                    if (currentY > 250) { // Nova página se necessário
                        doc.addPage();
                        currentY = 30;
                    }
                    
                    doc.text(item.produto_nome || 'Produto', margin, currentY);
                    doc.text(item.quantidade.toString(), margin + 100, currentY);
                    doc.text(`R$ ${item.preco_unitario.toFixed(2)}`, margin + 130, currentY);
                    doc.text(`R$ ${item.subtotal.toFixed(2)}`, margin + 170, currentY);
                    
                    totalGeral += parseFloat(item.subtotal);
                    currentY += 8;
                });
                
                // Linha separadora
                currentY += 5;
                doc.line(margin, currentY, pageWidth - margin, currentY);
                
                // Total
                currentY += 10;
                doc.setFont(undefined, 'bold');
                doc.text(`TOTAL: R$ ${pedido.valor_total.toFixed(2)}`, margin + 130, currentY);
                
                // Informações de pagamento
                currentY += 15;
                doc.setFont(undefined, 'bold');
                doc.text('PAGAMENTO:', margin, currentY);
                doc.setFont(undefined, 'normal');
                
                currentY += 8;
                doc.text(`Valor Pago: R$ ${pedido.valor_pago.toFixed(2)}`, margin, currentY);
                
                const valorPendente = pedido.valor_total - pedido.valor_pago;
                if (valorPendente > 0) {
                    currentY += 6;
                    doc.setFont(undefined, 'bold');
                    doc.text(`Restante (pagar na entrega): R$ ${valorPendente.toFixed(2)}`, margin, currentY);
                    doc.setFont(undefined, 'normal');
                }
                
                if (pedido.forma_pagamento) {
                    currentY += 8;
                    doc.text(`Forma de Pagamento: ${pedido.forma_pagamento}`, margin, currentY);
                }
                
                // Observações
                if (pedido.observacoes) {
                    currentY += 15;
                    doc.setFont(undefined, 'bold');
                    doc.text('OBSERVAÇÕES:', margin, currentY);
                    doc.setFont(undefined, 'normal');
                    
                    currentY += 8;
                    const observacoes = doc.splitTextToSize(pedido.observacoes, pageWidth - 2 * margin);
                    doc.text(observacoes, margin, currentY);
                }
                
                // Rodapé
                currentY = doc.internal.pageSize.height - 30;
                doc.setFontSize(8);
                doc.text('Obrigado pela preferência!', margin, currentY);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, currentY + 6);
                
                resolve(doc);
                
            } catch (error) {
                console.error('Erro ao gerar PDF:', error);
                reject(error);
            }
        });
    }
    
    async downloadReceipt(pedido, cliente, itens) {
        try {
            const pdf = await this.generateReceiptPDF(pedido, cliente, itens);
            pdf.save(`Recibo_Pedido_${pedido.numero_pedido}.pdf`);
            
            window.app.showToast('Recibo gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao baixar recibo:', error);
            window.app.showToast('Erro ao gerar recibo', 'error');
        }
    }
    
    async sendOrderConfirmationEmail(pedido, cliente, itens) {
        try {
            if (!this.emailConfig.serviceId || !this.emailConfig.templateId) {
                throw new Error('Configurações de email não encontradas');
            }
            
            // Preparar dados para o template de email
            const emailData = {
                to_email: cliente.email,
                to_name: cliente.nome,
                pedido_numero: pedido.numero_pedido,
                data_pedido: new Date(pedido.data_pedido).toLocaleDateString('pt-BR'),
                data_entrega: new Date(pedido.data_entrega).toLocaleDateString('pt-BR'),
                hora_entrega: pedido.hora_entrega || 'A combinar',
                valor_total: `R$ ${pedido.valor_total.toFixed(2)}`,
                valor_pago: `R$ ${pedido.valor_pago.toFixed(2)}`,
                valor_pendente: `R$ ${(pedido.valor_total - pedido.valor_pago).toFixed(2)}`,
                itens_pedido: this.formatItensForEmail(itens),
                observacoes: pedido.observacoes || 'Nenhuma observação',
                empresa_nome: this.companyInfo.name,
                empresa_telefone: this.companyInfo.phone,
                empresa_email: this.companyInfo.email
            };
            
            // Enviar email
            const response = await emailjs.send(
                this.emailConfig.serviceId,
                this.emailConfig.templateId,
                emailData
            );
            
            console.log('Email enviado:', response);
            window.app.showToast('Email de confirmação enviado!', 'success');
            
            return response;
            
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            window.app.showToast('Erro ao enviar email de confirmação', 'error');
            throw error;
        }
    }
    
    formatItensForEmail(itens) {
        return itens.map(item => 
            `• ${item.produto_nome || 'Produto'} - Qtd: ${item.quantidade} - R$ ${item.subtotal.toFixed(2)}`
        ).join('\n');
    }
    
    async printReceipt(pedido, cliente, itens) {
        try {
            const pdf = await this.generateReceiptPDF(pedido, cliente, itens);
            const pdfUrl = pdf.output('bloburl');
            
            // Abrir em nova janela para impressão
            const printWindow = window.open(pdfUrl);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error('Erro ao imprimir recibo:', error);
            window.app.showToast('Erro ao imprimir recibo', 'error');
        }
    }
    
    generateOrderNumber() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const time = now.getTime().toString().slice(-4);
        
        return `LEO${year}${month}${day}${time}`;
    }
}

// Instância global será criada pelo auth-system.js
// window.receiptSystem será definido quando o sistema for inicializado