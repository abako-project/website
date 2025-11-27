
/*
 * Ejecutar una promesa con un timeout.
 * Ejemplo:
 *    const r = await withTimeout(fetch(url), 5000)
 */
function withTimeout(promise, ms, msg) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(msg ?? "Timeout exceeded")), ms)
    );

    return Promise.race([promise, timeout]);
}