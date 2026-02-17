// // Vérifier l'authentification
// if (!checkAuth()) {
//     window.location.href = 'login.html';
// }

// // Obtenir l'utilisateur actuel
// const currentUser = getCurrentUser();

// // Afficher le message de bienvenue
// if (currentUser) {
//     document.getElementById('welcomeMessage').textContent = 
//         `Bienvenue, ${currentUser.username} !`;
    
//     // Afficher le lien admin si nécessaire
//     if (currentUser.role === 'admin') {
//         document.getElementById('adminLink').style.display = 'inline';
//     }
// }

// // Déconnexion
// document.getElementById('logoutBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.location.href = 'login.html';
// });

// // Charger les statistiques
// async function loadStats() {
//     try {
//         // Charger les devices
//         const devicesResponse = await apiCall('/api/devices/my-devices', 'GET');
//         const devices = devicesResponse.devices || [];
//         document.getElementById('deviceCount').textContent = devices.length;

//         // Charger les mesures
//         const measurementsResponse = await apiCall('/api/measurements?limit=1000', 'GET');
//         const measurements = measurementsResponse.measurements || [];
        
//         // Compter les mesures d'aujourd'hui
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayMeasurements = measurements.filter(m => 
//             new Date(m.timestamp) >= today
//         );
//         document.getElementById('measurementCount').textContent = todayMeasurements.length;

//         // Calculer la température moyenne
//         if (measurements.length > 0) {
//             const sum = measurements.reduce((acc, m) => acc + m.value, 0);
//             const avg = (sum / measurements.length).toFixed(1);
//             document.getElementById('avgTemp').textContent = `${avg}°C`;
//         }

//         // Remplir le filtre de devices
//         const deviceFilter = document.getElementById('deviceFilter');
//         devices.forEach(device => {
//             const option = document.createElement('option');
//             option.value = device.deviceId;
//             option.textContent = `${device.name} (${device.deviceId})`;
//             deviceFilter.appendChild(option);
//         });

//     } catch (error) {
//         console.error('Erreur lors du chargement des stats:', error);
//     }
// }

// // Charger les mesures
// async function loadMeasurements() {
//     try {
//         const deviceId = document.getElementById('deviceFilter').value;
//         const limit = document.getElementById('limitFilter').value || 50;

//         let endpoint = `/api/measurements?limit=${limit}`;
//         if (deviceId) {
//             endpoint += `&deviceId=${deviceId}`;
//         }

//         const response = await apiCall(endpoint, 'GET');
//         const measurements = response.measurements || [];

//         const tbody = document.getElementById('measurementsBody');
//         const loadingDiv = document.getElementById('loadingMessage');
//         const tableDiv = document.getElementById('measurementsTable');
//         const noDataDiv = document.getElementById('noMeasurements');

//         loadingDiv.style.display = 'none';

//         if (measurements.length === 0) {
//             tableDiv.style.display = 'none';
//             noDataDiv.style.display = 'block';
//             return;
//         }

//         noDataDiv.style.display = 'none';
//         tableDiv.style.display = 'block';

//         tbody.innerHTML = '';
//         measurements.forEach(measurement => {
//             const row = tbody.insertRow();
//             row.innerHTML = `
//                 <td><code>${measurement.deviceId}</code></td>
//                 <td><strong>${measurement.value}</strong></td>
//                 <td>${measurement.unit || 'celsius'}</td>
//                 <td>${formatDate(measurement.timestamp)}</td>
//             `;
//         });

//     } catch (error) {
//         console.error('Erreur lors du chargement des mesures:', error);
//         document.getElementById('loadingMessage').textContent = 
//             'Erreur lors du chargement des mesures';
//     }
// }

// // Charger les données au démarrage
// loadStats();
// loadMeasurements();

// // Actualiser automatiquement toutes les 30 secondes
// setInterval(() => {
//     loadStats();
//     loadMeasurements();
// }, 30000);


// Vérifier l'authentification
if (!checkAuth()) {
    window.location.href = 'login.html';
}

// Obtenir l'utilisateur actuel
const currentUser = getCurrentUser();

// Afficher le message de bienvenue
if (currentUser) {
    document.getElementById('welcomeMessage').textContent = 
        `Bienvenue, ${currentUser.username} !`;
    
    // Afficher le lien admin si nécessaire
    if (currentUser.role === 'admin') {
        document.getElementById('adminLink').style.display = 'inline';
    }
}

// Déconnexion
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Charger les statistiques
async function loadStats() {
    try {
        // Charger les devices de l'utilisateur
        const devicesResponse = await apiCall('/api/devices/my-devices', 'GET');
        const devices = devicesResponse.devices || [];
        document.getElementById('deviceCount').textContent = devices.length;

        // Charger les mesures de l'utilisateur (pas toutes, seulement les siennes)
        const measurementsResponse = await apiCall('/api/measurements?limit=1000', 'GET');
        const measurements = measurementsResponse.measurements || [];
        
        // Compter les mesures d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayMeasurements = measurements.filter(m => 
            new Date(m.timestamp) >= today
        );
        document.getElementById('measurementCount').textContent = todayMeasurements.length;

        // Calculer la température moyenne
        if (measurements.length > 0) {
            const sum = measurements.reduce((acc, m) => acc + m.value, 0);
            const avg = (sum / measurements.length).toFixed(1);
            document.getElementById('avgTemp').textContent = `${avg}°C`;
        } else {
            document.getElementById('avgTemp').textContent = '--';
        }

        // Remplir le filtre de devices (seulement les devices de l'utilisateur)
        const deviceFilter = document.getElementById('deviceFilter');
        deviceFilter.innerHTML = '<option value="">Tous mes devices</option>';
        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = `${device.name} (${device.deviceId})`;
            deviceFilter.appendChild(option);
        });

    } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        
        // Si error 403, probablement no tiene permisos
        if (error.message && error.message.includes('403')) {
            alert('Vous n\'avez pas accès à ces données');
        }
    }
}

// Charger les mesures (seulement les siennes pour usuario estándar)
async function loadMeasurements() {
    try {
        const deviceId = document.getElementById('deviceFilter').value;
        const limit = document.getElementById('limitFilter').value || 50;

        // El endpoint /api/measurements ya filtra automáticamente por userId
        // si el usuario no es admin
        let endpoint = `/api/measurements?limit=${limit}`;
        if (deviceId) {
            endpoint += `&deviceId=${deviceId}`;
        }

        const response = await apiCall(endpoint, 'GET');
        const measurements = response.measurements || [];

        const tbody = document.getElementById('measurementsBody');
        const loadingDiv = document.getElementById('loadingMessage');
        const tableDiv = document.getElementById('measurementsTable');
        const noDataDiv = document.getElementById('noMeasurements');

        loadingDiv.style.display = 'none';

        if (measurements.length === 0) {
            tableDiv.style.display = 'none';
            noDataDiv.style.display = 'block';
            noDataDiv.textContent = 'Aucune mesure disponible pour vos devices';
            return;
        }

        noDataDiv.style.display = 'none';
        tableDiv.style.display = 'block';

        tbody.innerHTML = '';
        measurements.forEach(measurement => {
            const row = tbody.insertRow();
            
            // Aplicar color según el valor (opcional)
            let valueClass = '';
            if (measurement.value > 26) {
                valueClass = 'style="color: #EF4444; font-weight: bold;"'; // Rojo si alta
            } else if (measurement.value < 18) {
                valueClass = 'style="color: #3B82F6; font-weight: bold;"'; // Azul si baja
            }
            
            row.innerHTML = `
                <td><code>${measurement.deviceId}</code></td>
                <td ${valueClass}><strong>${measurement.value}</strong></td>
                <td>${measurement.unit || 'celsius'}</td>
                <td>${formatDate(measurement.timestamp)}</td>
            `;
        });

    } catch (error) {
        console.error('Erreur lors du chargement des mesures:', error);
        document.getElementById('loadingMessage').textContent = 
            'Erreur lors du chargement des mesures';
        document.getElementById('loadingMessage').style.color = '#EF4444';
    }
}

// Charger les données au démarrage
loadStats();
loadMeasurements();

// Actualiser automatiquement toutes les 30 secondes
setInterval(() => {
    loadStats();
    loadMeasurements();
}, 30000);

// Event listeners para los filtros
document.getElementById('deviceFilter').addEventListener('change', loadMeasurements);
document.getElementById('limitFilter').addEventListener('change', loadMeasurements);