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
 * `nome: function() {}`, com `var ctx = this;` no topo, e callbacks internos em
 * `function() {}` acessando `ctx` via closure — evitando method shorthand ES6 e
 * arrow functions (que não vinculam `this` e podem quebrar na minificação do build).
 *
 * Chamadas REST internas usam fetch() + async/await + try/catch, com a URL
 * pública montada a partir de WCMAPI.getServerURL() — ver
 * context/platform-constitution.md#2-integrações-http (Integrações HTTP).
 *
 * i18n em .js (ver context/platform-constitution.md#1-internacionalização-em-arquivos-js): mesma sintaxe do .ftl —
 * `${i18n.getTranslation('chave')}`.
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
            icon: 'file-text',
            title: '${i18n.getTranslation("wizard.step.terms")}'
        },
        {
            id: 'install',
            phase: 'install',
            icon: 'download',
            title: '${i18n.getTranslation("wizard.step.install")}',
            items: [
                {
                    id: 'root-folder',
                    type: 'folder',
                    icon: 'folder',
                    title: '${i18n.getTranslation("item.folder")}',
                    description: '${i18n.getTranslation("item.folder.desc")}',
                    config: { name: 'Meu App', parentId: '0' }
                },
                {
                    id: 'form-categorias',
                    type: 'cardindex',
                    icon: 'file-text',
                    title: '${i18n.getTranslation("item.form")}',
                    description: '${i18n.getTranslation("item.form.desc")}',
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
            title: '${i18n.getTranslation("wizard.step.complete")}'
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
        var ctx = this;
        ctx._currentStep = 0;
        ctx._installResults = {};
        ctx._termsAccepted = false;

        // Cacheia templates Mustache da view.ftl
        ctx.templates = {};
        ctx.DOM.find('script[type="text/template"]').each(function() {
            var className = this.className.replace('template-', '');
            ctx.templates[className] = this.innerHTML;
        });

        ctx._render();
    },

    /* ═══════════════════════════════════════════════════════════════
     * RENDERIZAÇÃO (usa Mustache + Style Guide)
     * ═══════════════════════════════════════════════════════════════ */

    _render: function() {
        var ctx = this;
        var id = ctx.instanceId;
        var container = document.getElementById('wizard-content_' + id);

        // Layout principal
        container.innerHTML = Mustache.render(ctx.templates['wizard-main'], { instanceId: id });

        // Stepper
        ctx._renderStepper();

        // Steps content
        var stepsContainer = document.getElementById('wizard-steps-container_' + id);
        var html = '';

        for (var i = 0; i < ctx.steps.length; i++) {
            var step = ctx.steps[i];
            if (step.phase === 'terms') {
                html += Mustache.render(ctx.templates['step-terms'], { instanceId: id });
            } else if (step.phase === 'install') {
                html += Mustache.render(ctx.templates['step-install'], { instanceId: id });
            } else if (step.phase === 'complete') {
                html += Mustache.render(ctx.templates['step-complete'], { instanceId: id, ctaUrl: ctx.ctaUrl });
            }
        }
        stepsContainer.innerHTML = html;

        // Renderiza items do step install
        ctx._renderInstallItems();

        // Mostra o step atual
        ctx._showCurrentStep();

        // Inicia verificação
        ctx._verifyAll();
    },

    _renderStepper: function() {
        var ctx = this;
        var stepper = document.getElementById('wizard-stepper_' + ctx.instanceId);
        var html = '';

        for (var i = 0; i < ctx.steps.length; i++) {
            html += Mustache.render(ctx.templates['step-indicator'], {
                title: ctx.steps[i].title,
                done: i < ctx._currentStep,
                active: i === ctx._currentStep
            });
        }
        stepper.innerHTML = html;
    },

    _renderInstallItems: function() {
        var ctx = this;
        var id = ctx.instanceId;
        var step = ctx._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        var container = document.getElementById('install-items_' + id);
        var html = '<div class="list-group">';

        for (var i = 0; i < step.items.length; i++) {
            var item = step.items[i];
            html += Mustache.render(ctx.templates['resource-card'], {
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
        var btnArea = document.getElementById('install-btn-area_' + id);
        btnArea.innerHTML = Mustache.render(ctx.templates['btn-install'], {});
    },

    // Helper: localiza o step de instalação sem depender de arrow function.
    _findInstallStep: function() {
        var ctx = this;
        for (var i = 0; i < ctx.steps.length; i++) {
            if (ctx.steps[i].phase === 'install') {
                return ctx.steps[i];
            }
        }
        return null;
    },

    /* ═══════════════════════════════════════════════════════════════
     * NAVEGAÇÃO
     * ═══════════════════════════════════════════════════════════════ */

    prev: function() {
        var ctx = this;
        if (ctx._currentStep > 0) {
            ctx._currentStep--;
            ctx._showCurrentStep();
            ctx._renderStepper();
        }
    },

    next: function() {
        var ctx = this;
        var step = ctx.steps[ctx._currentStep];

        // Validação: termos precisam ser aceitos
        if (step.phase === 'terms' && !ctx._termsAccepted) {
            FLUIGC.toast({ message: '${i18n.getTranslation("msg.accept.terms")}', type: 'warning' });
            return;
        }

        if (ctx._currentStep < ctx.steps.length - 1) {
            ctx._currentStep++;
            ctx._showCurrentStep();
            ctx._renderStepper();
        }
    },

    _showCurrentStep: function() {
        var ctx = this;
        var id = ctx.instanceId;
        var steps = ['step-terms_' + id, 'step-install_' + id, 'step-complete_' + id];

        for (var i = 0; i < steps.length; i++) {
            var el = document.getElementById(steps[i]);
            if (el) {
                el.style.display = (i === ctx._currentStep) ? '' : 'none';
            }
        }
    },

    onTermsChange: function() {
        var ctx = this;
        var checkbox = document.getElementById('terms-accept_' + ctx.instanceId);
        ctx._termsAccepted = checkbox && checkbox.checked;
    },

    /* ═══════════════════════════════════════════════════════════════
     * VERIFICAÇÃO — Regra 1: verificar antes de instalar
     * ═══════════════════════════════════════════════════════════════ */

    _verifyAll: function() {
        var ctx = this;
        var step = ctx._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        // Encadeia a verificação de cada item preservando a ordem, sem async/await
        // (mantém callbacks em function() acessando ctx via closure).
        var index = 0;

        function verifyNext() {
            if (index >= step.items.length) {
                ctx._updateInstallButton();
                return;
            }

            var item = step.items[index];
            index++;
            ctx._showStatus(item.id, 'checking');

            ctx._verify(item, function(exists) {
                ctx._showStatus(item.id, exists ? 'installed' : 'pending');
                if (exists) {
                    ctx._installResults[item.id] = { exists: true };
                }
                verifyNext();
            }, function(errorMsg) {
                ctx._showStatus(item.id, 'error', errorMsg);
                verifyNext();
            });
        }

        verifyNext();
    },

    _verify: function(item, onDone, onError) {
        var ctx = this;
        switch (item.type) {
            case 'folder':
                ctx._verifyFolder(item.config, onDone, onError);
                break;
            case 'cardindex':
                ctx._verifyCardIndex(item.config, onDone, onError);
                break;
            default:
                onDone(false);
        }
    },

    /* ═══════════════════════════════════════════════════════════════
     * INSTALAÇÃO — Regra 2: instalar respeitando dependências
     * ═══════════════════════════════════════════════════════════════ */

    onInstall: function() {
        var ctx = this;
        var step = ctx._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        var index = 0;

        function installNext() {
            if (index >= step.items.length) {
                FLUIGC.toast({ message: '${i18n.getTranslation("msg.success")}', type: 'success' });
                ctx._updateInstallButton();
                return;
            }

            var item = step.items[index];
            index++;

            // Skip se já instalado
            if (ctx._installResults[item.id] && ctx._installResults[item.id].exists) {
                installNext();
                return;
            }

            ctx._showStatus(item.id, 'checking');

            ctx._install(item, function(result) {
                ctx._installResults[item.id] = result;
                ctx._showStatus(item.id, 'installed');
                installNext();
            }, function(errorMsg) {
                ctx._showStatus(item.id, 'error', errorMsg);
                FLUIGC.toast({ message: '${i18n.getTranslation("msg.error")}' + ': ' + errorMsg, type: 'danger' });
                // Para se dependência falhou (Regra 2)
            });
        }

        installNext();
    },

    _install: function(item, onDone, onError) {
        var ctx = this;
        switch (item.type) {
            case 'folder':
                ctx._installFolder(item.config, onDone, onError);
                break;
            case 'cardindex':
                ctx._installCardIndex(item.config, onDone, onError);
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
        var ctx = this;
        var url = WCMAPI.getServerURL() + '/dataset/api/v2/dataset-handle/search'
            + '?datasetId=document'
            + '&field=documentPK.documentId&field=documentDescription'
            + '&constraintsField=documentDescription&constraintsInitialValue=' + encodeURIComponent(config.name)
            + '&constraintsField=documentType&constraintsInitialValue=1'
            + '&constraintsField=activeVersion&constraintsInitialValue=true'
            + '&limit=1';

        try {
            var response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('HTTP ' + response.status);

            var data = await response.json();
            var items = (data && data.values) || [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].documentDescription === config.name) {
                    var id = items[i]['documentPK.documentId'];
                    if (id) {
                        ctx._installResults['root-folder'] = { folderId: String(id) };
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
        var ctx = this;
        var parentId = config.parentId || '0';

        try {
            var response = await fetch(WCMAPI.getServerURL() + '/api/public/ecm/document/createFolder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: config.name, parentId: parentId })
            });

            if (response.status === 409) {
                // Regra 4: 409 = já existe = sucesso
                ctx._verifyFolder(config, function() {
                    onDone(ctx._installResults['root-folder'] || { folderId: '0' });
                }, function() {
                    onDone({ folderId: '0' });
                });
                return;
            }
            if (!response.ok) throw new Error('HTTP ' + response.status);

            var data = await response.json();
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
        var url = WCMAPI.getServerURL() + '/dataset/api/v2/datasets?datasetId=' + encodeURIComponent(config.datasetName);

        try {
            var response = await fetch(url, { method: 'GET' });
            if (!response.ok) throw new Error('HTTP ' + response.status);

            var data = await response.json();
            var active = data && data.items && data.items.length > 0 && data.items[0].active === true;
            onDone(!!active);
        } catch (error) {
            onDone(false);
        }
    },

    _installCardIndex: async function(config, onDone, onError) {
        var ctx = this;

        // Resolve dependência: folderId da pasta (Regra 2)
        var folderId = '0';
        if (config.folderRef && ctx._installResults[config.folderRef]) {
            folderId = ctx._installResults[config.folderRef].folderId || '0';
        }

        try {
            // Download do ZIP embarcado no WAR do wizard.
            var zipResponse = await fetch(WCMAPI.getServerURL() + '/meuappwizard/resources/form/' + config.zipFile, {
                method: 'GET'
            });
            if (!zipResponse.ok) throw new Error('ZIP não encontrado: ' + config.zipFile);

            var zipBlob = await zipResponse.blob();
            var formData = new FormData();
            formData.append('mainFile', config.formName + '.html');
            formData.append('formName', config.formName);
            formData.append('descriptorField', config.descriptorField || '');
            formData.append('parentId', folderId);
            formData.append('datasetName', config.datasetName);
            formData.append('persistenceType', '1');
            formData.append('file', zipBlob, config.zipFile);

            var response = await fetch(WCMAPI.getServerURL() + '/ecm-forms/api/v2/cardindex', {
                method: 'POST',
                body: formData
            });

            if (response.status === 409) {
                // Regra 4: 409 = formulário já existe = sucesso
                onDone({ documentId: '0' });
                return;
            }
            if (!response.ok) throw new Error('HTTP ' + response.status);

            var data = await response.json();
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
        var ctx = this;
        var el = document.getElementById('status-' + itemId + '_' + ctx.instanceId);
        if (!el) {
            return;
        }

        var labels = {
            checking: '<span class="label label-default"><i class="animaliaicon animaliaicon-refresh icon-xs"></i></span>',
            installed: '<span class="label label-success">${i18n.getTranslation("label.installed")}</span>',
            pending: '<span class="label label-warning">${i18n.getTranslation("label.pending")}</span>',
            error: '<span class="label label-danger" title="' + (errorMsg || '') + '">${i18n.getTranslation("label.error")}</span>'
        };

        el.innerHTML = labels[status] || '';
    },

    _updateInstallButton: function() {
        var ctx = this;
        var step = ctx._findInstallStep();
        if (!step || !step.items) {
            return;
        }

        var allDone = true;
        for (var i = 0; i < step.items.length; i++) {
            if (!ctx._installResults[step.items[i].id]) {
                allDone = false;
                break;
            }
        }

        var btnArea = document.getElementById('install-btn-area_' + ctx.instanceId);
        if (!btnArea) {
            return;
        }

        if (allDone) {
            btnArea.innerHTML = Mustache.render(ctx.templates['btn-installed'], {});
        }
    }
});
