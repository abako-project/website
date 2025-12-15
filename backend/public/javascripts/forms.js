function submitFormById(formId) {
    showWaitModal();
    document.getElementById(formId)?.requestSubmit();
}

