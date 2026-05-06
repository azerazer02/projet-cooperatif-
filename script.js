const TOKEN_METEO = "865f6131824fa1477a364836f6f56e58154aef997c93bb59b7810f2f9bc19b1f"; 

const postalCodeInput = document.getElementById('postal-code');
const btnSearchCity = document.getElementById('btn-search-city');
const citySelect = document.getElementById('city-select');
const btnGetWeather = document.getElementById('btn-get-weather');
const weatherForm = document.getElementById('weather-form');
const errorMessage = document.getElementById('error-message');
const weatherResults = document.getElementById('weather-results');

const displayCityName = document.getElementById('display-city-name');
const elTmin = document.getElementById('tmin');
const elTmax = document.getElementById('tmax');
const elProbaRain = document.getElementById('probarain');
const elSunHours = document.getElementById('sun-hours');

btnSearchCity.addEventListener('click', async () => {
    const codePostal = postalCodeInput.value.trim();
    errorMessage.textContent = ''; 

    if (codePostal.length !== 5) {
        errorMessage.textContent = "Veuillez entrer un code postal valide à 5 chiffres.";
        return;
    }

    try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code&format=json`);
        
        if (!response.ok) throw new Error("Erreur lors de la récupération des communes.");
        
        const communes = await response.json();

        if (communes.length === 0) {
            errorMessage.textContent = "Aucune commune trouvée pour ce code postal.";
            citySelect.innerHTML = '<option value="">Aucune commune</option>';
            citySelect.disabled = true;
            btnGetWeather.disabled = true;
            return;
        }

        citySelect.innerHTML = '<option value="">Choisissez une commune</option>';
        communes.forEach(commune => {
            const option = document.createElement('option');
            option.value = commune.code; 
            option.textContent = commune.nom;
            citySelect.appendChild(option);
        });

        citySelect.disabled = false;
        citySelect.removeAttribute('aria-disabled');

    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Impossible de joindre l'API des communes.";
    }
});

citySelect.addEventListener('change', () => {
    if (citySelect.value !== "") {
        btnGetWeather.disabled = false;
        btnGetWeather.removeAttribute('aria-disabled');
    } else {
        btnGetWeather.disabled = true;
        btnGetWeather.setAttribute('aria-disabled', 'true');
    }
});

weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    errorMessage.textContent = '';
    weatherResults.classList.add('hidden');

    const inseeCode = citySelect.value;
    const cityName = citySelect.options[citySelect.selectedIndex].text;

    if (!inseeCode) return;

    try {
        const response = await fetch(`https://api.meteo-concept.com/api/forecast/daily/0?token=${TOKEN_METEO}&insee=${inseeCode}`);
        
        if (!response.ok) throw new Error("Erreur de connexion avec l'API météo ou Token invalide.");
        
        const data = await response.json();
        const forecast = data.forecast;

        displayCityName.textContent = cityName;
        
        elTmin.textContent = forecast.tmin;
        elTmax.textContent = forecast.tmax;
        elProbaRain.textContent = forecast.probarain;
        elSunHours.textContent = forecast.sun_hours;

        weatherResults.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Impossible de récupérer les données météo. Vérifiez votre token Météo-Concept.";
    }
});