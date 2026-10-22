// Exemplo mínimo de referência — utilitário de i18n backend (plain Java,
// NÃO FreeMarker) para a camada REST/service/entity do componente fictício
// "meuapp". Quarto mecanismo de i18n do Fluig, distinto dos três domínios de
// context/conventions.md#os-três-domínios-de-i18n-do-fluig (Os três domínios de i18n do Fluig):
// não depende
// da sessão do usuário logado, porque esta camada pode ser chamada por um
// cliente SEM sessão Fluig (ex.: página pública/anônima — ver
// ActivateRest.java e
// context/partner-store-architecture.md#provisionamento-de-credencial-via-keyring-em-enable
// (Provisionamento de credencial via Keyring em enable()). O locale é
// resolvido a partir do cabeçalho HTTP Accept-Language da própria requisição.
// Ver context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle
// (i18n em Camada REST/Java — ResourceBundle).
package com.meuapp.i18n;

import java.text.MessageFormat;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import javax.ws.rs.core.HttpHeaders;

/**
 * Utilitário final, sem estado. Carrega {@code messages[_locale].properties}
 * (bundle base {@code messages.properties} + um bundle por locale suportado)
 * e formata a mensagem com {@link MessageFormat} (marcadores posicionais
 * {@code {0}}, {@code {1}}, ...).
 */
public final class MessageUtils {

    private static final String BUNDLE_NAME = "messages";
    private static final Locale DEFAULT_LOCALE = new Locale("pt", "BR");

    private MessageUtils() {
        // utilitário — não instanciável
    }

    /**
     * Resolve o locale do chamador a partir do cabeçalho {@code Accept-Language}
     * da requisição HTTP. Não há sessão de usuário a consultar nesta camada —
     * por isso o sinal de idioma vem do próprio cliente HTTP.
     */
    public static Locale resolveLocale(HttpHeaders headers) {
        if (headers != null) {
            List<Locale> acceptable = headers.getAcceptableLanguages();
            if (acceptable != null && !acceptable.isEmpty()) {
                return acceptable.get(0);
            }
        }
        return DEFAULT_LOCALE;
    }

    /**
     * Carrega o bundle do locale informado e formata {@code key} com
     * {@code args} (marcadores posicionais {@code {0}}, {@code {1}}, ...).
     * Em {@link MissingResourceException} (bundle ou chave ausente para o
     * locale resolvido), cai para o bundle do {@link #DEFAULT_LOCALE}.
     */
    public static String getMessage(Locale locale, String key, Object... args) {
        Locale resolved = locale == null ? DEFAULT_LOCALE : locale;
        try {
            ResourceBundle bundle = ResourceBundle.getBundle(BUNDLE_NAME, resolved);
            return MessageFormat.format(bundle.getString(key), args);
        } catch (MissingResourceException e) {
            ResourceBundle fallback = ResourceBundle.getBundle(BUNDLE_NAME, DEFAULT_LOCALE);
            return MessageFormat.format(fallback.getString(key), args);
        }
    }
}
