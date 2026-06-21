<#-- Exemplo mínimo de referência — View de Layout WCM Fluig (FreeMarker) -->
<#-- Demonstra: import de wcm.ftl, wrapper fluig-style-guide, declaração de -->
<#-- slots nomeados (SlotA/SlotB) renderizados via macro pública @wcm.renderSlot, -->
<#-- e i18n para texto visível. Não é um projeto completo. -->
<#-- Ver context/architecture.md e context/style-guide.md. -->

<#-- Importa os utilitários públicos de layout (macros de header, menu, slots, footer). -->
<#import "/wcm.ftl" as wcm/>

<#-- Em modo de edição (montagem da página), o portal exibe alertas/controles. -->
<#if pageRender.isPreviewMode() = true>
    <@wcm.previewPageAlert />
</#if>

<#-- Wrapper raiz do layout: ativa o escopo do Style Guide (fluig-style-guide). -->
<div class="wcm-wrapper-content fluig-style-guide">

    <#-- Cabeçalho e menu do portal são fornecidos por macros públicas. -->
    <#if pageRender.isEditMode() = false>
        <@wcm.header authenticated=pageRender.isUserLogged()?c />
        <@wcm.menu />
    </#if>

    <div class="wcm-all-content">
        <div id="wcm-content" class="clearfix wcm-background">

            <#-- Região de largura total (SlotA): recebe um ou mais widgets. -->
            <#-- A chave do slot (ex.: SlotA) deve casar com layout.defaultSlot no application.info. -->
            <div class="editable-slot slotfull layout-1-1" id="slotFull1">
                <@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />
            </div>

            <#-- Segunda região (SlotB), empilhada abaixo da primeira. -->
            <div class="editable-slot slotfull layout-1-1" id="slotFull2">
                <@wcm.renderSlot id="SlotB" editableSlot="true" isResponsiveSlot="true" />
            </div>

            <#-- Rodapé opcional via macro pública. -->
            <@wcm.footer layoutuserlabel="layoutexample.user" />
        </div>
    </div>
</div>
