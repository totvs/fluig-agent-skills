/**
 * Dataset customizado com suporte completo a filtros.
 * Referência: context/conventions.md#consumo-de-dataset-em-widget-padrão-superwidget
 *
 * Este dataset demonstra o tratamento correto de:
 * - fields: colunas a retornar (null = todas)
 * - constraints: filtros a aplicar (MUST, MUST_NOT, SHOULD)
 * - sortFields: ordenação dos resultados (null = ordem padrão)
 *
 * Sintaxe compatível com o motor Rhino (base ES5): var/function tradicionais,
 * sem arrow functions nem template literals.
 * Ver context/technologies.md#runtime-rhino-sintaxe-rígida-não-é-es6 (Runtime Rhino)
 * e context/architecture.md#api-pública-de-dataset--assinaturas-datasetfactory
 * (API pública de Dataset — assinaturas).
 */
function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    // =========================================================================
    // 1. DADOS DE ORIGEM
    // =========================================================================
    // Em um cenário real, esses dados poderiam vir de uma API externa, banco de
    // dados ou outro dataset. Aqui usamos dados estáticos para fins didáticos.
    // Cada registro representa um produto com 5 campos.

    var colunas = ['codigo', 'nome', 'categoria', 'preco', 'ativo'];

    var registros = [
        { codigo: 'PRD001', nome: 'Notebook Pro 15',     categoria: 'Informática', preco: '4500.00', ativo: 'true' },
        { codigo: 'PRD002', nome: 'Mouse Wireless',      categoria: 'Periféricos', preco: '89.90',   ativo: 'true' },
        { codigo: 'PRD003', nome: 'Teclado Mecânico',    categoria: 'Periféricos', preco: '299.00',  ativo: 'true' },
        { codigo: 'PRD004', nome: 'Monitor 27 4K',       categoria: 'Informática', preco: '2200.00', ativo: 'false' },
        { codigo: 'PRD005', nome: 'Headset Gamer',       categoria: 'Áudio',       preco: '450.00',  ativo: 'true' },
        { codigo: 'PRD006', nome: 'Webcam Full HD',      categoria: 'Periféricos', preco: '320.00',  ativo: 'true' },
        { codigo: 'PRD007', nome: 'SSD 1TB NVMe',        categoria: 'Informática', preco: '650.00',  ativo: 'true' },
        { codigo: 'PRD008', nome: 'Impressora Laser',    categoria: 'Informática', preco: '1800.00', ativo: 'false' },
        { codigo: 'PRD009', nome: 'Caixa de Som BT',     categoria: 'Áudio',       preco: '180.00',  ativo: 'true' },
        { codigo: 'PRD010', nome: 'Hub USB-C 7 portas',  categoria: 'Periféricos', preco: '210.00',  ativo: 'true' }
    ];

    // =========================================================================
    // 2. APLICAÇÃO DE CONSTRAINTS (FILTROS)
    // =========================================================================
    // O parâmetro constraints é um array de objetos Constraint; cada um expõe as
    // PROPRIEDADES (não métodos getter) definidas na doc oficial do dataset avançado
    // (TDN "Construção do Dataset Avançado"):
    //   - fieldName       → nome do campo a filtrar
    //   - initialValue    → valor inicial (ou único, para igualdade)
    //   - finalValue      → valor final (para range/between)
    //   - constraintType  → tipo, comparado direto com o enum ConstraintType.*
    //
    // Tipos de constraint:
    //   ConstraintType.MUST      → obrigatório (AND): registro DEVE atender
    //   ConstraintType.SHOULD    → opcional (OR): registro PODE atender
    //   ConstraintType.MUST_NOT  → negação (NOT): registro NÃO DEVE atender
    //
    // Quando constraints é null ou vazio, retornamos todos os registros.

    var filtrados = registros;

    if (constraints != null && constraints.length > 0) {
        // Separa as constraints por tipo para aplicação correta da lógica
        var mustConstraints = [];
        var mustNotConstraints = [];
        var shouldConstraints = [];

        for (var i = 0; i < constraints.length; i++) {
            var c = constraints[i];
            // Leitura por PROPRIEDADE e comparação direta com o enum ConstraintType
            // (conforme a doc oficial: `constraints[0].constraintType == ConstraintType.MUST`).
            if (c.constraintType == ConstraintType.MUST) {
                mustConstraints.push(c);
            } else if (c.constraintType == ConstraintType.MUST_NOT) {
                mustNotConstraints.push(c);
            } else if (c.constraintType == ConstraintType.SHOULD) {
                shouldConstraints.push(c);
            }
        }

        // Aplica os filtros na ordem: MUST → MUST_NOT → SHOULD
        // MUST: registro deve atender TODAS as constraints MUST (lógica AND)
        if (mustConstraints.length > 0) {
            filtrados = filtrarMust(filtrados, mustConstraints);
        }

        // MUST_NOT: registro NÃO pode atender nenhuma constraint MUST_NOT (exclusão)
        if (mustNotConstraints.length > 0) {
            filtrados = filtrarMustNot(filtrados, mustNotConstraints);
        }

        // SHOULD: se houver constraints SHOULD, inclui registros que atendam
        // pelo menos UMA delas (lógica OR), unidos aos já filtrados por MUST
        if (shouldConstraints.length > 0) {
            filtrados = filtrarShould(filtrados, shouldConstraints, registros, mustConstraints, mustNotConstraints);
        }
    }

    // =========================================================================
    // 3. ORDENAÇÃO (sortFields)
    // =========================================================================
    // O parâmetro sortFields é um array de nomes de colunas.
    // Quando null ou vazio, mantemos a ordem padrão (inserção).
    // Exemplo de uso: sortFields = ['categoria', 'nome'] ordena por categoria
    // primeiro e depois por nome dentro de cada categoria.

    if (sortFields != null && sortFields.length > 0) {
        filtrados = ordenar(filtrados, sortFields);
    }

    // =========================================================================
    // 4. MONTAGEM DO DATASET DE RETORNO (fields)
    // =========================================================================
    // O parâmetro fields indica quais colunas devem ser retornadas.
    // Quando null ou vazio, retornamos todas as colunas.
    // Quando preenchido, retornamos apenas as colunas solicitadas — isso melhora
    // performance evitando tráfego de dados desnecessários.

    var colunasRetorno = colunas; // padrão: todas
    if (fields != null && fields.length > 0) {
        colunasRetorno = [];
        for (var f = 0; f < fields.length; f++) {
            // Valida que a coluna solicitada existe nos dados
            for (var c2 = 0; c2 < colunas.length; c2++) {
                if (fields[f].toLowerCase() === colunas[c2].toLowerCase()) {
                    colunasRetorno.push(colunas[c2]);
                    break;
                }
            }
        }
        // Fallback: se nenhuma coluna válida foi encontrada, retorna todas
        if (colunasRetorno.length === 0) {
            colunasRetorno = colunas;
        }
    }

    // Declara as colunas no dataset de saída
    for (var col = 0; col < colunasRetorno.length; col++) {
        dataset.addColumn(colunasRetorno[col]);
    }

    // Adiciona os registros filtrados e ordenados ao dataset
    for (var r = 0; r < filtrados.length; r++) {
        var registro = filtrados[r];
        var row = [];
        for (var rc = 0; rc < colunasRetorno.length; rc++) {
            row.push(registro[colunasRetorno[rc]] || '');
        }
        dataset.addRow(row);
    }

    return dataset;
}

// =============================================================================
// FUNÇÕES AUXILIARES — Filtragem
// =============================================================================

/**
 * Filtra registros que atendem TODAS as constraints MUST (lógica AND).
 * Suporta igualdade (initialValue == finalValue) e range (initialValue != finalValue).
 */
function filtrarMust(registros, mustConstraints) {
    var resultado = [];

    for (var i = 0; i < registros.length; i++) {
        var registro = registros[i];
        var atendeTodasMust = true;

        for (var j = 0; j < mustConstraints.length; j++) {
            if (!registroAtendeConstraint(registro, mustConstraints[j])) {
                atendeTodasMust = false;
                break;
            }
        }

        if (atendeTodasMust) {
            resultado.push(registro);
        }
    }

    return resultado;
}

/**
 * Remove registros que atendem QUALQUER constraint MUST_NOT (exclusão).
 * Se o registro bater com pelo menos uma MUST_NOT, ele é descartado.
 */
function filtrarMustNot(registros, mustNotConstraints) {
    var resultado = [];

    for (var i = 0; i < registros.length; i++) {
        var registro = registros[i];
        var atendeAlgumMustNot = false;

        for (var j = 0; j < mustNotConstraints.length; j++) {
            if (registroAtendeConstraint(registro, mustNotConstraints[j])) {
                atendeAlgumMustNot = true;
                break;
            }
        }

        // Só inclui se NÃO atender nenhuma MUST_NOT
        if (!atendeAlgumMustNot) {
            resultado.push(registro);
        }
    }

    return resultado;
}

/**
 * Aplica lógica SHOULD (OR): inclui registros que atendam pelo menos UMA das
 * constraints SHOULD, desde que também passem pelos filtros MUST e MUST_NOT.
 * Se já existem registros filtrados por MUST, os SHOULD expandem o resultado
 * adicionando mais registros que atendam a lógica OR.
 */
function filtrarShould(filtradosAtuais, shouldConstraints, todosRegistros, mustConstraints, mustNotConstraints) {
    // Busca nos registros originais quais atendem pelo menos um SHOULD
    var candidatosShould = [];

    for (var i = 0; i < todosRegistros.length; i++) {
        var registro = todosRegistros[i];
        var atendeAlgumShould = false;

        for (var j = 0; j < shouldConstraints.length; j++) {
            if (registroAtendeConstraint(registro, shouldConstraints[j])) {
                atendeAlgumShould = true;
                break;
            }
        }

        if (atendeAlgumShould) {
            // Verifica que também não viola MUST_NOT
            var violaMustNot = false;
            for (var k = 0; k < mustNotConstraints.length; k++) {
                if (registroAtendeConstraint(registro, mustNotConstraints[k])) {
                    violaMustNot = true;
                    break;
                }
            }

            if (!violaMustNot && !jaExisteNoArray(filtradosAtuais, registro)) {
                candidatosShould.push(registro);
            }
        }
    }

    // Combina: registros MUST + registros SHOULD adicionais
    return filtradosAtuais.concat(candidatosShould);
}

/**
 * Verifica se um registro atende uma constraint individual.
 * Suporta dois modos:
 *   - Igualdade: initialValue == finalValue → compara exatamente
 *   - Range/Between: initialValue != finalValue → verifica se o valor do
 *     registro está entre initialValue e finalValue (inclusive)
 */
function registroAtendeConstraint(registro, constraint) {
    // Leitura por PROPRIEDADE (doc oficial: constraint.fieldName / .initialValue /
    // .finalValue). Os valores podem vir como java.lang.String (interop Rhino);
    // normalize com String(...) antes de comparar — `===`/comparadores entre
    // java.lang.String e string JS podem dar resultado inesperado.
    var campo = String(constraint.fieldName);
    var valorInicial = String(constraint.initialValue);
    var valorFinal = String(constraint.finalValue);

    // Obtém o valor do campo no registro (case-insensitive no nome do campo)
    var valorRegistro = '';
    for (var key in registro) {
        if (key.toLowerCase() === campo.toLowerCase()) {
            valorRegistro = String(registro[key]);
            break;
        }
    }

    // Se initialValue e finalValue são iguais → comparação de igualdade
    if (valorInicial === valorFinal) {
        return valorRegistro.toLowerCase() === valorInicial.toLowerCase();
    }

    // Se initialValue != finalValue → filtro por faixa (range/between).
    // ⚠️ Comparar como STRING daria resultado errado em números
    // (ex.: "89.90" > "4500.00" é true lexicograficamente). Quando os três
    // valores são numéricos, compare como número; senão, caia para string
    // (datas em ISO yyyy-MM-dd, por ex., ordenam corretamente como string).
    var nReg = parseFloat(valorRegistro);
    var nIni = parseFloat(valorInicial);
    var nFim = parseFloat(valorFinal);
    var todosNumericos = !isNaN(nReg) && !isNaN(nIni) && !isNaN(nFim);
    if (todosNumericos) {
        return nReg >= nIni && nReg <= nFim;
    }
    return valorRegistro >= valorInicial && valorRegistro <= valorFinal;
}

/**
 * Verifica se um registro já existe no array (evita duplicatas no SHOULD).
 */
function jaExisteNoArray(arr, registro) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].codigo === registro.codigo) {
            return true;
        }
    }
    return false;
}

// =============================================================================
// FUNÇÕES AUXILIARES — Ordenação
// =============================================================================

/**
 * Ordena registros com base nos campos indicados em sortFields.
 * A ordenação é multi-campo: ordena pelo primeiro campo e, em caso de empate,
 * usa o segundo campo como critério de desempate, e assim por diante.
 * Ordenação padrão é ascendente (A→Z, 0→9).
 */
function ordenar(registros, sortFields) {
    // Cria uma cópia para não alterar o array original
    var copia = registros.slice(0);

    copia.sort(function(a, b) {
        for (var i = 0; i < sortFields.length; i++) {
            var campo = sortFields[i];
            var valorA = (a[campo] || '').toLowerCase();
            var valorB = (b[campo] || '').toLowerCase();

            if (valorA < valorB) return -1;
            if (valorA > valorB) return 1;
            // Se iguais, passa para o próximo campo de ordenação
        }
        return 0; // Todos os campos iguais → mantém ordem original
    });

    return copia;
}
