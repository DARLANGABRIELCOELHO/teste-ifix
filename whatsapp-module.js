// whatsapp-module.js - Módulo de agendamento direto via WhatsApp 

const WhatsAppScheduler = {
    // Gerar mensagem direta com as informações da pesquisa
    generateDirectMessage(selectionInfo) {
        return `Olá! Gostaria de agendar um diagnóstico para meu iPhone na IFIX.

INFORMAÇÕES:
• Modelo: ${selectionInfo.model}
• Serviço desejado: ${selectionInfo.service}
• Forma de pagamento: ${selectionInfo.payment}
• Valor sugerido no site: ${selectionInfo.price}

Observações:
• O valor final será confirmado após diagnóstico técnico.
• O orçamento online é apenas uma estimativa prévia.`;
    },

    // Formatar nome do serviço para exibição
    formatServiceName(service) {
        const serviceMap = {
            "TROCA DE TELA": "Troca de Tela",
            "TROCA DE BATERIA": "Troca de Bateria",
            "VIDRO TRASEIRO": "Troca de Vidro Traseiro",
            "FACE ID": "Reparo do Face ID",
            "CONECTOR DE CARGA": "Troca do Conector de Carga",
            "": "Não especificado"
        };

        return serviceMap[service] || service;
    },

    // Formatar nome do modelo
    formatModelName(model) {
        if (model === "" || model === "Não especificado") return "Não especificado";

        let formatted = model.replace("IPHONE ", "");
        formatted = formatted.replace(/([A-Z])(\d)/, '$1 $2');

        return `iPhone ${formatted}`;
    },

    // Obter preço
    getCurrentPrice(repairApp, selectionInfo) {
        const { rawModel, rawService, payment } = selectionInfo;

        if (rawModel !== "Não especificado" && rawService !== "Não especificado") {
            const priceData = repairApp.prices[rawModel]?.[rawService];
            if (priceData) {
                const paymentKey = payment === 'A VISTA' ? 'avista' : 'parcelado';
                return priceData[paymentKey] || "Consulte o site para valor";
            }
        }

        return "Consulte o site para valores";
    },

    // Obter seleção atual
    getCurrentSelectionInfo(repairApp) {
        const modelSelect = repairApp.modelSelect;
        const serviceSelect = repairApp.serviceSelect;
        const paymentRadio = document.querySelector('input[name="payment"]:checked');

        const selectedModel = modelSelect.value || "Não especificado";
        const selectedService = serviceSelect.value || "Não especificado";
        const selectedPayment = paymentRadio ? paymentRadio.value : "Parcelado";

        const formattedService = this.formatServiceName(selectedService);
        const formattedModel = this.formatModelName(selectedModel);

        return {
            model: formattedModel,
            service: formattedService,
            payment: selectedPayment,
            rawModel: selectedModel,
            rawService: selectedService
        };
    },

    // Criar botão
    initScheduleButton(repairApp) {
        const existingBtn = document.querySelector('.whatsapp-schedule-btn');
        if (existingBtn) existingBtn.remove();

        const scheduleBtn = document.createElement('button');
        scheduleBtn.className = 'whatsapp-schedule-btn';
        scheduleBtn.innerHTML = '📅 Agendar Diagnóstico via WhatsApp';
        scheduleBtn.style.cssText = `
            background: #15bb39;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 15px;
            margin-top: 15px;
            display: block;
            margin: 20px auto;
            width: 100%;
            max-width: 300px;
            transition: all 0.2s ease;
        `;

        scheduleBtn.onmouseenter = () => {
            scheduleBtn.style.background = '#12a330';
            scheduleBtn.style.transform = 'translateY(-2px)';
            scheduleBtn.style.boxShadow = '0 5px 15px rgba(21, 187, 57, 0.3)';
        };

        scheduleBtn.onmouseleave = () => {
            scheduleBtn.style.background = '#15bb39';
            scheduleBtn.style.transform = 'translateY(0)';
            scheduleBtn.style.boxShadow = 'none';
        };

        // Evento do botão
        scheduleBtn.onclick = () => {
            const selectionInfo = this.getCurrentSelectionInfo(repairApp);
            selectionInfo.price = this.getCurrentPrice(repairApp, selectionInfo);

            const message = this.generateDirectMessage(selectionInfo);

            const numero = "+5515991852555"; // número da iFix
            const whatsappUrl = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
        };

        const searchBox = document.querySelector('.search-box');
        const buttonsDiv = searchBox.querySelector('.buttons');
        searchBox.insertBefore(scheduleBtn, buttonsDiv.nextSibling);
    },

    // Inicializar módulo
    initialize(repairApp) {
        this.initScheduleButton(repairApp);

        const updateButtonText = () => {
            const selectionInfo = this.getCurrentSelectionInfo(repairApp);
            const btn = document.querySelector('.whatsapp-schedule-btn');

            if (selectionInfo.model !== "Não especificado" && selectionInfo.service !== "Não especificado") {
                btn.innerHTML = `📅 Agendar ${selectionInfo.model}`;
                btn.style.background = '#6a5acd';
            } else {
                btn.innerHTML = '📅 Agendar Diagnóstico via WhatsApp';
                btn.style.background = '#15bb39';
            }
        };

        const modelSelect = repairApp.modelSelect;
        const serviceSelect = repairApp.serviceSelect;
        const paymentRadios = document.querySelectorAll('input[name="payment"]');

        [modelSelect, serviceSelect].forEach(select => {
            select.addEventListener('change', updateButtonText);
        });

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', updateButtonText);
        });

        updateButtonText();
    }
};

// exportar globalmente
window.WhatsAppScheduler = WhatsAppScheduler;

