// email-config.js - Configurações de email para Leo's Cake
export default {
  // Configurações SMTP (fallback)
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    }
  },

  // Informações da empresa
  empresa: {
    nome: 'Leo\'s Cake',
    email: 'leoscakegta@gmail.com',
    telefone: '(11) 99999-9999',
    endereco: 'São Paulo, SP'
  },

  // Configurações Brevo (Sendinblue)
  brevo: {
    apiKey: 'b08fd92706321d43582cda769d1b62c7',
    apiId: '04ab8c3f733d8cd137a312a8e90fb2a6',
    fromEmail: 'leoscakegta@gmail.com',
    fromName: 'Leo\'s Cake'
  },

  // Templates de email
  templates: {
    confirmado: {
      subject: 'Pedido Confirmado - Leo\'s Cake',
      template: 'templateConfirmado'
    },
    producao: {
      subject: 'Seu pedido está em produção - Leo\'s Cake',
      template: 'templateProducao'
    },
    saiu_entrega: {
      subject: 'Seu pedido saiu para entrega - Leo\'s Cake',
      template: 'templateSaiuEntrega'
    },
    entregue: {
      subject: 'Pedido Entregue - Leo\'s Cake',
      template: 'templateEntregue'
    },
    agradecimento: {
      subject: 'Obrigado por escolher Leo\'s Cake!',
      template: 'templateAgradecimento'
    }
  }
};