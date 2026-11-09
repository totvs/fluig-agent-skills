<div id="meuappwizard_${instanceId}" class="fluig-style-guide super-widget wcm-widget-class meuappwizard" data-params="MeuAppWizard.instance({})">

    <#-- Header -->
    <div class="page-header fs-mb-24">
        <h1 class="fs-no-margin">${i18n.getTranslation("wizard.title")}</h1>
    </div>

    <#-- Container principal (renderizado via JS) -->
    <div id="wizard-content_${instanceId}"></div>

    <#-- ═══ TEMPLATES MUSTACHE ═══ -->

    <#-- Layout principal: stepper vertical + container de steps + navegação -->
    <script type="text/template" class="template-wizard-main">
        <div class="row">
            <div class="col-md-3">
                <ul class="steps steps-vertical" id="wizard-stepper_{{instanceId}}"></ul>
            </div>
            <div class="col-md-9">
                <div id="wizard-steps-container_{{instanceId}}"></div>
                <ul class="pager fs-mt-24" id="wizard-nav_{{instanceId}}">
                    <li class="previous">
                        <a href="#" data-wizard-prev>
                            <i class="flaticon flaticon-arrow-left icon-xs"></i>
                            ${i18n.getTranslation("label.previous")}
                        </a>
                    </li>
                    <li class="next">
                        <a href="#" data-wizard-next>
                            ${i18n.getTranslation("label.next")}
                            <i class="flaticon flaticon-arrow-right icon-xs"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </script>

    <#-- Step indicator (componente Steps do Style Guide) -->
    <script type="text/template" class="template-step-indicator">
        <li class="step-item{{#done}} done{{/done}}{{#active}} active{{/active}}">
            <span class="step-bullet"></span>
            <span class="step-label">{{title}}</span>
        </li>
    </script>


    <#-- Step: Termos de Uso (checkbox + texto) -->
    <script type="text/template" class="template-step-terms">
        <div class="panel panel-default" id="step-terms_{{instanceId}}">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <i class="flaticon flaticon-file icon-sm fs-mr-8"></i>
                    ${i18n.getTranslation("wizard.step.terms")}
                </h3>
            </div>
            <div class="panel-body">
                <div class="well well-sm fs-mb-16" style="max-height:200px;overflow-y:auto">
                    <p>${i18n.getTranslation("wizard.terms.text")}</p>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" id="terms-accept_{{instanceId}}" data-accept-terms>
                        ${i18n.getTranslation("wizard.terms.accept")}
                    </label>
                </div>
            </div>
        </div>
    </script>

    <#-- Step: Instalação (lista de recursos com status individual) -->
    <script type="text/template" class="template-step-install">
        <div class="panel panel-default" id="step-install_{{instanceId}}">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <i class="flaticon flaticon-download icon-sm fs-mr-8"></i>
                    ${i18n.getTranslation("wizard.step.install")}
                </h3>
            </div>
            <div class="panel-body">
                <p class="text-muted fs-mb-16">${i18n.getTranslation("wizard.step.install.desc")}</p>
                <div id="install-items_{{instanceId}}"></div>
                <div class="fs-mt-16" id="install-btn-area_{{instanceId}}"></div>
            </div>
        </div>
    </script>

    <#-- Card de recurso individual (list-group-item com status) -->
    <script type="text/template" class="template-resource-card">
        <div class="list-group-item fs-display-flex fs-align-items-center" id="item-{{id}}_{{instanceId}}">
            <i class="flaticon flaticon-{{icon}} icon-sm fs-mr-12"></i>
            <div class="fs-flex-1">
                <strong>{{title}}</strong>
                <p class="fs-no-margin text-muted fs-text-sm">{{description}}</p>
            </div>
            <span class="fs-ml-8" id="status-{{id}}_{{instanceId}}">
                <span class="label label-default">${i18n.getTranslation("label.pending")}</span>
            </span>
        </div>
    </script>

    <#-- Botão Instalar (Alert info) -->
    <script type="text/template" class="template-btn-install">
        <div class="alert alert-info fs-display-flex fs-align-items-center">
            <i class="flaticon flaticon-info icon-sm fs-mr-8"></i>
            <span class="fs-flex-1">${i18n.getTranslation("wizard.install.hint")}</span>
            <button class="btn btn-primary fs-ml-16" type="button" data-install>
                ${i18n.getTranslation("label.install")}
            </button>
        </div>
    </script>

    <#-- Botão Instalado (Alert success) -->
    <script type="text/template" class="template-btn-installed">
        <div class="alert alert-success fs-display-flex fs-align-items-center">
            <i class="flaticon flaticon-check-circle icon-sm fs-mr-8"></i>
            <strong>${i18n.getTranslation("label.installed")}</strong>
        </div>
    </script>

    <#-- Step: Conclusão (CTA) -->
    <script type="text/template" class="template-step-complete">
        <div class="panel panel-default" id="step-complete_{{instanceId}}">
            <div class="panel-body text-center fs-py-48">
                <i class="illustration illustration-success illustration-lg fs-mb-16"></i>
                <h3>${i18n.getTranslation("wizard.complete.title")}</h3>
                <p class="text-muted fs-mb-24">${i18n.getTranslation("wizard.complete.desc")}</p>
                <a class="btn btn-primary btn-lg" href="{{ctaUrl}}">
                    ${i18n.getTranslation("label.cta")}
                    <i class="flaticon flaticon-arrow-right icon-sm fs-ml-4"></i>
                </a>
            </div>
        </div>
    </script>

</div>
