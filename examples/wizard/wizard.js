/**
 * meuappwizard.js — Wizard de Instalação (arquivo único)
 *
 * Demonstra o padrão de wizard em um único SuperWidget:
 * - Configuração inline (sem WizardConfig.js separado)
 * - Verificar → Instalar → Feedback por recurso
 * - Sem CSS customizado (só Style Guide)
 * - Dependências entre recursos (pasta → formulário)
 *
 * Sintaxe obrigatória dentro de .extend({}) (ver
 * context/conventions.md#sintaxe-de-métodos-dentro-de-extend): métodos declarados como
 * `nome: function() {}` (nunca method shorthand ES6 nem arrow como método) e SEM
 * `var ctx = this;`. Os callbacks (eventos, verificação, instalação) são Arrow
 * Functions, que mantêm o `this` do widget sem cache de escopo.
 *
 * Chamadas REST internas usam fetch() + async/await + try/catch, com a URL
 * pública montada a partir de WCMAPI.getServerURL() — ver
 * context/platform-constitution.md#2-integrações-http (Integrações HTTP).
 *
 * i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js):
 * usa-se a interpolação em colchetes do FreeMarker (alternativa à sintaxe de
 * cifrão e chaves), resolvida server-side e sem colidir com template literals
 * ES6. Atribuída a variável/propriedade, fica sempre entre aspas. Não misture
 * as duas sintaxes no mesmo arquivo e nunca escreva a interpolação em comentário.
 *
 * Fonte de verdade: context/conventions.md#visão-geral (Visão Geral);
 * context/platform-constitution.md#visão-geral (Visão Geral);
 * context/partner-store-conventions.md#convenções-da-solução-para-a-store-do-totvs-fluig-parceiro
 */
'use strict';

// Exceção controlada à convenção ES6+: a variável raiz que recebe
// SuperWidget.extend(...) usa `var`.
var MeuAppWizard = SuperWidget.extend({

    instanceId: null,

    /* ═══════════════════════════════════════════════════════════════
     * CONFIGURAÇÃO INLINE (equivale ao antigo WizardConfig.js)
     * ═══════════════════════════════════════════════════════════════ */

    ctaUrl: '/portal/p/meuapp_component/meuapp_feed_page',

    steps: [
        {
            id: 'terms',
            phase: 'terms',
            icon: 'file',
            title: '[=i18n.getTranslation("wizard.step.terms")]'
        },
        {
            id: 'install',
            phase: 'install',
            icon: 'download',
            title: '[=i18n.getTranslation("wizard.step.install")]',
            items: [
                {
                    id: 'root-folder',
                    type: 'folder',
                    icon: 'folder',
                    title: '[=i18n.getTranslation("item.folder")]',
                    description: '[=i18n.getTranslation("item.folder.desc")]',
                    config: { name: 'Meu App', parentId: '0' }
                },
                {
                    id: 'form-categorias',
                    type: 'cardindex',
                    icon: 'file',
                    title: '[=i18n.getTranslation("item.form")]',
                    description: '[=i18n.getTranslation("item.form.desc")]',
                    config: {
                        datasetName: 'meuapp_categorias',
                        formName: 'meuapp_categorias',
                        zipFile: 'meuapp_categorias.zip',
                        folderRef: 'root-folder'
                    }
                }
            ]
        },
        {
            id: 'complete',
            phase: 'complete',
            icon: 'check-circle',
            title: '[=i18n.getTranslation("wizard.step.complete")]'
        }
    ],

    /* ═══════════════════════════════════════════════════════════════
     * BINDINGS (delegação de eventos via SuperWidget)
     * ═══════════════════════════════════════════════════════════════ */

    bindings: {
        local: {
            'wizard-prev': ['click_prev'],
            'wizard-next': ['click_next'],
            'accept-terms': ['change_onTermsChange'],
            'install': ['click_onInstall']
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * INIT — Ponto de entrada
     * ═══════════════════════════════════════════════════════════════ */

    init: function() {
        this._currentStep = 0;
        this._installResults = {};
        this._termsAccepted = false;

        // Cacheia templates Mustache da view.ftl
        this.templates = {};
        // Arrow Function: o `this` do widget é preservado; o elemento corrente
        // do .each() vem pelo 2º parâmetro (em arrow, o `this` do jQuery não existe).
        this.DOM.find('script[type="text/template"]').each((index, element) => {
            const className = element.className.replace('template-', '');
            this.templates[className] = element.innerHTML;
        });

        this._render();
    },

    /* ═══════════════════════════════════════════════════════════════
     * RENDERIZAÇÃO (usa Mustache + Style Guide)
     * ═══════════════════════════════════════════════════════════════ */

    _render: function() {
        const id = this.instanceId;
        const container = document.getElementById('wizard-content_' + id);

        // Layout principal
        container.innerHTML = Mustache.render(this.templates['wizard-main'], { instanceId: id });

        // Stepper
        this._renderStepper();

        // Steps content
        const stepsContainer = document.getElementById('wizard-steps-container_' + id);
        let html = '';

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            if (step.phase === 'terms') {
                html += Mustache.render(this.templates['step-terms'], { instanceId: id });
            } else if (step.phase === 'install') {
                html += Mustache.render(this.templates['step-install'], { instanceId: id });
            } else if (step.phase === 'complete') {
                html += Mustache.render(this.templates['step-complete'], { instanceId: id, ctaUrl: this.ctaUrl });
            }
        }
        stepsContainer.innerHTML = html;

        // Renderiza items do step install
        this._renderInstallItems();

        // Mostra o step atual
        this._showCurrentStep();

        // Inicia verificação
        this._verifyAll();
    },

    _renderStepper: function() {
        const stepper = document.getElementById('wizard-stepper_' + this.instanceId);
        let html = '';

        for (let i = 0; i < this.steps.length; i++) {
            html += Mustache.render(this.templates['step-indicator'], {
                title: this.steps[i].title,
                done: i < this._currentStep,
                active: i === this._currentStep
            });
        }
        stepper.innerHTML = html;
    },

    _renderInstallItems: function() {
        const id = this.instanceId;
        const step = this._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        const container = document.getElementById('install-items_' + id);
        let html = '<div class="list-group">';

        for (let i = 0; i < step.items.length; i++) {
            const item = step.items[i];
            html += Mustache.render(this.templates['resource-card'], {
                id: item.id,
                icon: item.icon,
                title: item.title,
                description: item.description,
                instanceId: id
            });
        }
        html += '</div>';
        container.innerHTML = html;

        // Botão instalar
        const btnArea = document.getElementById('install-btn-area_' + id);
        btnArea.innerHTML = Mustache.render(this.templates['btn-install'], {});
    },

    // Helper: localiza o step de instalação.
    _findInstallStep: function() {
        for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].phase === 'install') {
                return this.steps[i];
            }
        }
        return null;
    },

    /* ═══════════════════════════════════════════════════════════════
     * NAVEGAÇÃO
     * ═══════════════════════════════════════════════════════════════ */

    prev: function() {
        if (this._currentStep > 0) {
            this._currentStep--;
            this._showCurrentStep();
            this._renderStepper();
        }
    },

    next: function() {
        const step = this.steps[this._currentStep];

        // Validação: termos precisam ser aceitos
        if (step.phase === 'terms' && !this._termsAccepted) {
            FLUIGC.toast({ message: '[=i18n.getTranslation("msg.accept.terms")]', type: 'warning' });
            return;
        }

        if (this._currentStep < this.steps.length - 1) {
            this._currentStep++;
            this._showCurrentStep();
            this._renderStepper();
        }
    },

    _showCurrentStep: function() {
        const id = this.instanceId;
        const steps = ['step-terms_' + id, 'step-install_' + id, 'step-complete_' + id];

        for (let i = 0; i < steps.length; i++) {
            const el = document.getElementById(steps[i]);
            if (el) {
                el.style.display = (i === this._currentStep) ? '' : 'none';
            }
        }
    },

    onTermsChange: function() {
        const checkbox = document.getElementById('terms-accept_' + this.instanceId);
        this._termsAccepted = checkbox && checkbox.checked;
    },

    /* ═══════════════════════════════════════════════════════════════
     * VERIFICAÇÃO — Regra 1: verificar antes de instalar
     * ═══════════════════════════════════════════════════════════════ */

    _verifyAll: function() {
        const step = this._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        // Encadeia a verificação de cada item preservando a ordem, sem async/await
        // (callbacks em Arrow Functions, que mantêm o `this` do widget).
        let index = 0;

        const verifyNext = () => {
            if (index >= step.items.length) {
                this._updateInstallButton();
                return;
            }

            const item = step.items[index];
            index++;
            this._showStatus(item.id, 'checking');

            this._verify(item, (exists) => {
                this._showStatus(item.id, exists ? 'installed' : 'pending');
                if (exists) {
                    this._installResults[item.id] = { exists: true };
                }
                verifyNext();
            }, (errorMsg) => {
                this._showStatus(item.id, 'error', errorMsg);
                verifyNext();
            });
        }

        verifyNext();
    },

    _verify: function(item, onDone, onError) {
        switch (item.type) {
            case 'folder':
                this._verifyFolder(item.config, onDone, onError);
                break;
            case 'cardindex':
                this._verifyCardIndex(item.config, onDone, onError);
                break;
            default:
                onDone(false);
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * INSTALAÇÃO — Regra 2: instalar respeitando dependências
     * ═══════════════════════════════════════════════════════════════ */

    onInstall: function() {
        const step = this._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        let index = 0;

        const installNext = () => {
            if (index >= step.items.length) {
                FLUIGC.toast({ message: '[=i18n.getTranslation("msg.success")]', type: 'success' });
                this._updateInstallButton();
                return;
            }

            const item = step.items[index];
            index++;

            // Skip se já instalado
            if (this._installResults[item.id] && this._installResults[item.id].exists) {
                installNext();
                return;
            }

            this._showStatus(item.id, 'checking');

            this._install(item, (result) => {
                this._installResults[item.id] = result;
                this._showStatus(item.id, 'installed');
                installNext();
            }, (errorMsg) => {
                this._showStatus(item.id, 'error', errorMsg);
                FLUIGC.toast({ message: '[=i18n.getTranslation("msg.error")]' + ': ' + errorMsg, type: 'danger' });
                // Para se dependência falhou (Regra 2)
            });
        }

        installNext();
    },

    _install: function(item, onDone, onError) {
        switch (item.type) {
            case 'folder':
                this._installFolder(item.config, onDone, onError);
                break;
            case 'cardindex':
                this._installCardIndex(item.config, onDone, onError);
                break;
            default:
                onError('Tipo desconhecido: ' + item.type);
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * TIPO: FOLDER — Verificar e instalar pasta no GED
     * Chamadas REST internas via fetch() + async/await + try/catch, URL
     * pública montada a partir de WCMAPI.getServerURL().
     * ═══════════════════════════════════════════════════════════════ */

    _verifyFolder: async function(config, onDone, onError) {
        const url = WCMAPI.getServerURL() + '/dataset/api/v2/dataset-handle/search'
            + '?datasetId=document'
            + '&field=documentPK.documentId&field=documentDescription'
            + '&constraintsField=documentDescription&constraintsInitialValue=' + encodeURIComponent(config.name)
            + '&constraintsField=documentType&constraintsInitialValue=1'
            + '&constraintsField=activeVersion&constraintsInitialValue=true'
            + '&limit=1';

        try {
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();
            const items = (data && data.values) || [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].documentDescription === config.name) {
                    const id = items[i]['documentPK.documentId'];
                    if (id) {
                        this._installResults['root-folder'] = { folderId: String(id) };
                    }
                    onDone(true);
                    return;
                }
            }
            onDone(false);
        } catch (error) {
            onDone(false);
        }
    },

    _installFolder: async function(config, onDone, onError) {
        const parentId = config.parentId || '0';

        try {
            const response = await fetch(WCMAPI.getServerURL() + '/api/public/ecm/document/createFolder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: config.name, parentId: parentId })
            });

            if (response.status === 409) {
                // Regra 4: 409 = já existe = sucesso
                this._verifyFolder(config, () => {
                    onDone(this._installResults['root-folder'] || { folderId: '0' });
                }, () => {
                    onDone({ folderId: '0' });
                });
                return;
            }
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();
            onDone({ folderId: String(data.content.id) });
        } catch (error) {
            onError('Falha ao criar pasta: ' + error.message);
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * TIPO: CARDINDEX — Verificar e instalar formulário
     * Chamadas REST internas via fetch() + async/await + try/catch, URL
     * pública montada a partir de WCMAPI.getServerURL().
     * ═══════════════════════════════════════════════════════════════ */

    _verifyCardIndex: async function(config, onDone, onError) {
        const url = WCMAPI.getServerURL() + '/dataset/api/v2/datasets?datasetId=' + encodeURIComponent(config.datasetName);

        try {
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();
            const active = data && data.items && data.items.length > 0 && data.items[0].active === true;
            onDone(!!active);
        } catch (error) {
            onDone(false);
        }
    },

    _installCardIndex: async function(config, onDone, onError) {

        // Resolve dependência: folderId da pasta (Regra 2)
        let folderId = '0';
        if (config.folderRef && this._installResults[config.folderRef]) {
            folderId = this._installResults[config.folderRef].folderId || '0';
        }

        try {
            // Download do ZIP embarcado no WAR do wizard.
            const zipResponse = await fetch(WCMAPI.getServerURL() + '/meuappwizard/resources/form/' + config.zipFile, {
                method: 'GET'
            });
            if (!zipResponse.ok) throw new Error('ZIP não encontrado: ' + config.zipFile);

            const zipBlob = await zipResponse.blob();
            const formData = new FormData();
            formData.append('mainFile', config.formName + '.html');
            formData.append('formName', config.formName);
            formData.append('descriptorField', config.descriptorField || '');
            formData.append('parentId', folderId);
            formData.append('datasetName', config.datasetName);
            formData.append('persistenceType', '1');
            formData.append('file', zipBlob, config.zipFile);

            const response = await fetch(WCMAPI.getServerURL() + '/ecm-forms/api/v2/cardindex', {
                method: 'POST',
                body: formData
            });

            if (response.status === 409) {
                // Regra 4: 409 = formulário já existe = sucesso
                onDone({ documentId: '0' });
                return;
            }
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const data = await response.json();
            onDone({ documentId: String(data.documentId || data.id || '0') });
        } catch (error) {
            onError('Falha ao criar formulário: ' + error.message);
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * FEEDBACK — Regra 3: status individual por recurso
     * Usa Labels do Style Guide (label-success/warning/danger)
     * ═══════════════════════════════════════════════════════════════ */

    _showStatus: function(itemId, status, errorMsg) {
        const el = document.getElementById('status-' + itemId + '_' + this.instanceId);
        if (!el) {
            return;
        }

        const labels = {
            checking: '<span class="label label-default"><i class="flaticon flaticon-refresh icon-xs"></i></span>',
            installed: '<span class="label label-success">[=i18n.getTranslation("label.installed")]</span>',
            pending: '<span class="label label-warning">[=i18n.getTranslation("label.pending")]</span>',
            error: '<span class="label label-danger" title="' + (errorMsg || '') + '">[=i18n.getTranslation("label.error")]</span>'
        };

        el.innerHTML = labels[status] || '';
    },

    _updateInstallButton: function() {
        const step = this._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        let allDone = true;
        for (let i = 0; i < step.items.length; i++) {
            if (!this._installResults[step.items[i].id]) {
                allDone = false;
                break;
            }
        }

        const btnArea = document.getElementById('install-btn-area_' + this.instanceId);
        if (!btnArea) {
            return;
        }

        if (allDone) {
            btnArea.innerHTML = Mustache.render(this.templates['btn-installed'], {});
        }
    }
});
