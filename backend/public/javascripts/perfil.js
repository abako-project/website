

if (document.getElementById('languages')) {
     new Choices('#languages', {
         removeItemButton: true,
         searchEnabled: true,
         placeholderValue: 'Select languages...',
     });
}

if (document.getElementById('clientLanguages')) {
    new Choices('#clientLanguages', {
        removeItemButton: true,
        searchEnabled: true,
        placeholderValue: 'Select languages...',
    });
}

if (document.getElementById('skills')) {
    new Choices('#skills', {
        removeItemButton: true,
        searchEnabled: true,
        placeholderValue: 'Select skills... ',
    });
}

if (document.getElementById('availabilityType')) {

    const toggle = document.getElementById('availableToggle');
    const box = document.getElementById('availabilityOptions');
    const hourlyBox = document.getElementById('hourlyInput');
    const availabilitySelect = document.getElementById("availabilityType");

    

    // Función que muestra u oculta el bloque entero del trabajo disponible
    function refreshAvailability() {
        box.style.display = toggle.checked ? "block" : "none";
        
        hourlyBox.style.display = (toggle.checked && availabilitySelect.value === "WeeklyHours") ? "block" : "none";
    }

    availabilitySelect.addEventListener("change", refreshAvailability);
    toggle.addEventListener('change', refreshAvailability);
    refreshAvailability();                                      // Inicializar al cargar la página       
}

// Vista previa de la nueva imagen del perfil seleccionada
document.getElementById("img").addEventListener("change", function () {
    const preview = document.getElementById("photoPreview");
    const file = this.files[0];

    if (!file) return (preview.style.display = "none");

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});

