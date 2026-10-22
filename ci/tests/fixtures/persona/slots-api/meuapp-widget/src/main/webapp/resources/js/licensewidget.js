// Widget de exemplo (fixture de teste): consome a API de validação de slotID
// do License Server, que é marcador técnico exclusivo da Store.
function checkSlot(slotId) {
    return fetch(`/license/api/v1/slots/${slotId}`)
        .then((response) => response.json());
}
