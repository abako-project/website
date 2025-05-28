async function registerCredential() {
    const resp = await fetch('/auth/generate-registration-options');
    const options = await resp.json();
    const credential = await navigator.credentials.create({ publicKey: options });
    await fetch('/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
    });
