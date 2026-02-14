
if (document.getElementById('availabilityType')) {

    const toggle = document.getElementById('availableToggle');
    const box = document.getElementById('availabilityOptions');
    const hourlyBox = document.getElementById('hourlyInput');
    const availabilitySelect = document.getElementById("availabilityType");



    // Function that shows or hides the entire work availability block
    function refreshAvailability() {
        box.style.display = toggle.checked ? "block" : "none";

        hourlyBox.style.display = (toggle.checked && availabilitySelect.value === "WeeklyHours") ? "block" : "none";
    }

    availabilitySelect.addEventListener("change", refreshAvailability);
    toggle.addEventListener('change', refreshAvailability);
    refreshAvailability();                                      // Initialize on page load
}
