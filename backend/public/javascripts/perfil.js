

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


    const availabilityChoices = new Choices('#availabilityType', {
            removeItemButton: true,
            searchEnabled: false,
            placeholderValue: 'Select availability...',
        });

    
    //Actualizar los campos ocultos al cambiar la selección de disponibilidad
    availabilitySelect.addEventListener("change", () => {
        const selected = availabilityChoices.getValue(true); // ["full", "hourly", ...]
        
        document.getElementById("isFullHidden").value = 
            selected.includes("full") ? "1" : "";

        document.getElementById("isPartHidden").value = 
            selected.includes("part") ? "1" : "";

        document.getElementById("isHourlyHidden").value = 
            selected.includes("hourly") ? "1" : "";
        
        refreshAvailability()
    });
    

    // Función que muestra u oculta el bloque entero del trabajo disponible
    function refreshAvailability() {
        box.style.display = toggle.checked ? "block" : "none";
        
        const selected = availabilityChoices.getValue(true); 
        hourlyBox.style.display =  toggle.checked && selected.includes("hourly") ? "block" : "none";
    }

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

