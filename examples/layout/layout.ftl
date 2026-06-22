<#-- Exemplo mínimo de referência — View de Layout WCM Fluig (FreeMarker) -->
<#-- Demonstra a ESTRUTURA HTML RÍGIDA de um layout de portal: imports -->
<#-- obrigatórios, bloco de preview, wrapper wcm-wrapper-content → wcm-all-content -->
<#-- → wcm-content → ${divMasterId}, blocos condicionais de edição, slots nomeados -->
<#-- (SlotA/SlotB) via @wcm.renderSlot e footer condicionado ao tema. -->
<#-- A liberdade está nos slots dentro de ${divMasterId}; o wrapper NÃO muda. -->
<#-- Não é um projeto completo. Ver context/architecture.md e context/style-guide.md. -->

<#-- Importa as macros públicas de layout (header, menu, slots, footer). -->
<#import "/wcm.ftl" as wcm/>

<#-- Variáveis globais dos layouts. -->
<#import "/layout-globals.ftl" as globals />

<#-- Bloco de pré-visualização da página (modo preview). -->
<#if pageRender.isPreviewMode() = true>
    <@wcm.previewPageAlert />
    <@wcm.deviceTogglePreview />
</#if>

<#-- Wrapper raiz OBRIGATÓRIO: classes de estado preenchidas pela plataforma. -->
<#-- Em layout de portal NÃO se usa fluig-style-guide no wrapper raiz. -->
<div class="wcm-wrapper-content ${wcmLayoutEditClass!""} ${pageAuthTypeClass!""}">

    <#-- Cabeçalho e menu do portal: somente fora do modo de edição. -->
    <#if pageRender.isEditMode() != true>
        <@wcm.header authenticated=pageRender.isUserLogged()?c />
        <@wcm.menu />
    </#if>

    <div class="wcm-all-content ${wcmResponsiveMenuOpenClass!""}">

        <div id="wcm-content" class="clearfix wcm-background">

            <#-- Controles do construtor de páginas: somente no modo de edição. -->
            <#if pageRender.isEditMode() = true>
                <@wcm.editHeader />
                <@wcm.widgetsList />
            </#if>

            <#-- Contêiner-mestre dos slots: é aqui que as regiões variam. -->
            <div id="${divMasterId!""}">

                <#-- Slot A — região de largura total (grid layout-1-1). -->
                <#-- O id do slot padrão deve casar com layout.defaultSlot no application.info. -->
                <div class="editable-slot slotfull layout-1-1" id="slotFull1">
                    <@wcm.renderSlot id="SlotA" editableSlot="true" isResponsiveSlot="true" />
                </div>

                <#-- Slot B — segunda região, empilhada abaixo. -->
                <div class="editable-slot slotfull layout-1-1" id="slotFull2">
                    <@wcm.renderSlot id="SlotB" editableSlot="true" isResponsiveSlot="true" />
                </div>

                <#-- Footer omitido no tema responsivo. -->
                <#if fluigThemeCode != "responsive_theme">
                    <@wcm.footer layoutuserlabel="layoutexample.user" />
                </#if>
            </div>
        </div>
    </div>
</div>
