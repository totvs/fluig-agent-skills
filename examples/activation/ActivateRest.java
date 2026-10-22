// Exemplo mínimo de referência — camada REST que consome a credencial
// Exemplo mínimo de referência — camada REST que consome o Keyring provisionado
// por Activate.enable() (ver Activate.java). Demonstra: Keyring.getKeys() ->
// KeyVO -> DefaultOAuthConsumer (signpost) -> HttpURLConnection assinada ->
// chamada a uma API pública do Fluig. Também demonstra o quarto mecanismo de
// i18n do Fluig (ver MessageUtils.java): erro tratado no catch devolve uma
// mensagem localizada via Accept-Language, não via sessão do usuário — este
// endpoint pode ser chamado por uma página pública/anônima, sem sessão
// Fluig. Simplificado/comentado, não é um projeto completo — endpoint único
// como referência (o sample real tem mais de um, mas a lógica de
// Keyring/signpost é a mesma).
// Ver context/partner-store-architecture.md#provisionamento-de-credencial-via-keyring-em-enable
// (Provisionamento de credencial via Keyring em enable()),
// context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store e
// context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle
// (i18n em Camada REST/Java — ResourceBundle).
//
// Componente fictício "meuapp" — mesmo usado em Activate.java deste diretório.
package com.meuapp.rest;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.fluig.customappkey.Keyring;
import com.fluig.sdk.api.customappkey.KeyVO;
import com.meuapp.i18n.MessageUtils;

import oauth.signpost.OAuthConsumer;
import oauth.signpost.basic.DefaultOAuthConsumer;

/**
 * Endpoint consumido por uma página PÚBLICA/anônima (sem usuário autenticado)
 * que precisa de dado protegido da plataforma. O navegador chama este
 * endpoint; é ESTE código (backend), nunca o navegador, que assina a chamada
 * à API pública do Fluig com as credenciais reais — elas nunca chegam ao
 * cliente nem ao fonte Java.
 */
@Path("/activate")
public class ActivateRest {

    // Mesmo valor de Activate.APP_KEY — é o identificador de busca do
    // Keyring, NÃO um segredo (ver comentário em Activate.java).
    private static final String APP_KEY = "1234-5678-9876-5432";

    // Injetado pelo container JAX-RS — usado para resolver o locale do
    // chamador via Accept-Language (ver MessageUtils.java e
    // context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle). Necessário porque este endpoint
    // pode ser chamado por uma página pública/anônima, sem sessão Fluig.
    @Context
    private HttpHeaders headers;

    @GET
    @Path("/userInfo/{tenantId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUserInfo(@PathParam("tenantId") Long tenantId) {
        try {
            // 1. Recupera as credenciais reais (geradas pela plataforma na
            //    ativação) a partir do identificador de busca — nunca hardcoded.
            KeyVO key = Keyring.getKeys(tenantId, APP_KEY);

            // 2. Monta o consumer OAuth 1.0 (signpost) com as credenciais do KeyVO.
            OAuthConsumer consumer = new DefaultOAuthConsumer(key.getConsumerKey(), key.getConsumerSecret());
            consumer.setTokenWithSecret(key.getToken(), key.getTokenSecret());

            // 3. Monta a chamada à API pública do Fluig e assina a requisição.
            String url = key.getDomainUrl() + "/api/public/2.0/users/getCurrent";
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            try {
                conn.setRequestMethod("GET");
                conn.setDoInput(true);
                consumer.sign(conn);
                conn.connect();

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String body = reader.lines().collect(Collectors.joining("\n"));
                    return Response.ok(body).build();
                }
            } finally {
                conn.disconnect();
            }
        } catch (Exception exception) {
            // Mensagem localizada via Accept-Language (não via sessão do
            // usuário — este endpoint pode ser chamado sem sessão Fluig).
            // Nunca expor stacktrace/detalhe ao cliente (ver
            // context/backend-java-maven.md#respostas-rest — Respostas REST); o
            // detalhe real deve ser logado no servidor, fora deste exemplo.
            String localizedMessage = MessageUtils.getMessage(
                    MessageUtils.resolveLocale(headers), "error.unexpected");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(localizedMessage)
                    .build();
        }
    }
}
