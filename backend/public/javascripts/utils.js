
/*
 * Ejecutar una promesa con un timeout.
 * Ejemplo:
 *    try {
 *        const r = await promiseWithTimeout(fetch(url), 5000);
 *    } catch(err) {
 *        console.log(err.message);
 *    }
 */
function promiseWithTimeout(promise, ms, msg) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(msg ?? "Timeout exceeded")), ms)
    );

    return Promise.race([promise, timeout]);
}

/*
 * Ejecutar un fetch con un timeout.
 * Ejemplo:
 *    try {
 *        const r = await fetchWithTimeout(url, 5000);
 *    } catch(err) {
 *        console.log(err.message);
 *    }
 */
async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);

    try {
        const res = await fetch(url, { signal: controller.signal });
        return res;
    } finally {
        clearTimeout(id);
    }
}