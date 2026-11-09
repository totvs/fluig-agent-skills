// Exemplo mínimo de referência — ActivationListener (Eventos de Componente, parceiro Fluig)
// Demonstra: contrato de ativação (getArtifactFileName/install/enable/disable),
// o padrão de provisionamento idempotente dentro de install() e o safety check
// de admin de tenant. Simplificado/comentado, não é um projeto completo.
// Ver context/backend-java-maven.md#provisionamento-via-eventos-de-componente-activationlistener
// (Provisionamento via Eventos de Componente) e
// context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store
//
// Componente fictício "meuapp" — mesmo nome usado em examples/wizard/, para
// deixar explícito que Wizard e ActivationListener são rotas alternativas do
// MESMO componente de exemplo (ver critério de decisão na doc de contexto).
package com.meuapp.service;

import com.fluig.customappkey.Keyring;
import com.fluig.sdk.api.component.activation.ActivationEvent;
import com.fluig.sdk.api.component.activation.ActivationListener;

import javax.ejb.Remote;
import javax.ejb.Stateless;

/**
 * {@code mappedName}/{@code name} DEVEM bater exatamente com
 * {@code activation.class=activator/meuapp} declarado no application.info do
 * módulo config — não é o FQN desta classe, é o identificador do ativador.
 */
@Remote
@Stateless(mappedName = "activator/meuapp", name = "activator/meuapp")
public class Activate implements ActivationListener {

    // Identificador de busca do Keyring para este componente — formato
    // XXXX-XXXX-XXXX-XXXX, escolhido pelo próprio parceiro. NÃO é um segredo:
    // é só o rótulo que diz ao Keyring QUAL entrada do cofre provisionar/
    // consultar (análogo ao serviceCode do Cadastro de Serviços). Vazar este
    // valor não concede acesso a nada — por isso é seguro como constante.
    // O segredo de fato (consumerSecret/token) é gerado e guardado pelo
    // Keyring da plataforma e NUNCA aparece no fonte — ver ActivateRest.java.
    private static final String APP_KEY = "1234-5678-9876-5432";

    // Nome do artefato efetivamente implantado (o que a plataforma empacotou),
    // usado para localizar o arquivo no diretório de artefatos implantáveis.
    @Override
    public String getArtifactFileName() {
        return "meuapp-pack.ear";
    }

    /**
     * Disparado pela plataforma na primeira instalação OU em toda reativação/
     * atualização via Central de Componentes ou Exportação/Importação de
     * Páginas — NUNCA em deploy manual arbitrário. Por isso install() PRECISA
     * ser idempotente: ele roda de novo a cada reinstalação.
     */
    @Override
    public void install(ActivationEvent event) {

        // Passo 0 (safety) — recusar provisionamento em massa como admin de
        // INSTÂNCIA (cross-tenant/super-admin). O provisionamento deste
        // formulário é por tenant; executar como super-admin instanciaria o
        // recurso fora do contexto de empresa esperado.
        // if (!isTenantAdministrator(event)) {
        //     throw new IllegalStateException(
        //         "install() deve rodar no contexto de um administrador de "
        //         + "tenant — recusado para administrador de instância.");
        // }

        // Passo 1 (idempotência — OBRIGATÓRIO) — consultar se o formulário/
        // dataset já existe para este tenant/locale ANTES de criar algo.
        // install() é chamado de novo em toda reativação: sem esta checagem,
        // cada reinstalação duplicaria o formulário e os registros de seed.
        // boolean jaExiste = existeFormulario("meuapp_config");
        // if (jaExiste) {
        //     return; // nada a fazer — já provisionado nesta instalação anterior
        // }

        // Passo 2 — abrir o artefato implantado (WAR/EAR) como zip via a API
        // de diretório de artefatos implantáveis da plataforma, e extrair os
        // recursos embarcados em src/main/resources/:
        //   - form/            (HTML do formulário, .properties de título, ícone)
        //   - formdata/<locale>/*.properties (um arquivo por registro de seed)

        // Passo 3 — enviar os arquivos extraídos via a API pública de arquivos
        // de conteúdo e registrar o formulário via a API pública de
        // card-index/form: nome do dataset vem do .html principal, título vem
        // do .properties de parâmetros (chaveado por locale).

        // Passo 4 — para cada .properties de seed (exceto o de título/params),
        // criar um registro via a API pública de card-item/form-record,
        // mapeando cada chave de propriedade para o campo correspondente do
        // formulário. (Avançado/opcional: alguns valores podem usar
        // placeholders resolvidos em tempo de instalação, ex. date-math —
        // fora do escopo deste exemplo mínimo.)

        // Integração com serviço externo (se houver): registrar via a API
        // pública de Cadastro de Serviços, usando credencial/URL coletada
        // previamente no wizard/geração ou vinda de configuração — NUNCA um
        // segredo literal no código Java.
    }

    /**
     * Disparado quando o componente é habilitado (ex.: reativado após estar
     * desabilitado). Normalmente não reexecuta o provisionamento de install() —
     * apenas religa comportamento/integrações que dependem do estado "ativo".
     *
     * Uso diferente do mesmo contrato: aqui é o lugar de provisionar as
     * credenciais OAuth do componente no Keyring da plataforma, chamando
     * Keyring.provision(APP_KEY). A partir daí, a camada REST (ver
     * ActivateRest.java) recupera as credenciais reais em tempo de execução
     * via Keyring.getKeys(tenantId, APP_KEY) — elas nunca ficam no fonte.
     */
    @Override
    public void enable(ActivationEvent event) throws Exception {
        Keyring.provision(APP_KEY);
    }

    /**
     * Disparado quando o componente é desabilitado. Deve liberar/encerrar o
     * que for específico do estado "ativo" (ex.: parar integrações), sem
     * remover os dados/formulários provisionados por install().
     */
    @Override
    public void disable(ActivationEvent event) {
        // stub — sem lógica neste exemplo mínimo
    }
}
