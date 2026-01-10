function submitFormById(formId) {
    const formElement = document.getElementById(formId);
    formElement?.addEventListener("submit", showWaitModal)
    formElement?.requestSubmit();
}

