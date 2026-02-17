// // Vérifier l'authentification et les permissions
// if (!checkAuth()) {
//     window.location.href = 'login.html';
// }

// const currentUser = getCurrentUser();
// if (!currentUser || currentUser.role !== 'admin') {
//     window.location.href = 'error.html?error=unauthorized';
// }

// // Déconnexion
// document.getElementById('logoutBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.location.href = 'login.html';
// });

// // Charger les utilisateurs
// async function loadUsers() {
//     try {
//         const response = await apiCall('/api/user', 'GET');
//         const users = response.users || [];

//         const tbody = document.getElementById('usersBody');
//         tbody.innerHTML = '';

//         users.forEach(user => {
//             const row = tbody.insertRow();
//             row.innerHTML = `
//                 <td>${user.username}</td>
//                 <td>${user.email}</td>
//                 <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
//                 <td>${user.devices ? user.devices.length : 0}</td>
//                 <td>
//                     ${user.role !== 'admin' ? `<button class="btn btn-danger" onclick="deleteUser('${user._id}')">Supprimer</button>` : ''}
//                 </td>
//             `;
//         });

//         // Remplir le select pour l'association
//         const selectUser = document.getElementById('selectUser');
//         selectUser.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
//         users.forEach(user => {
//             const option = document.createElement('option');
//             option.value = user._id;
//             option.textContent = `${user.username} (${user.email})`;
//             selectUser.appendChild(option);
//         });

//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors du chargement des utilisateurs');
//     }
// }

// // Supprimer un utilisateur
// async function deleteUser(userId) {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
//         return;
//     }

//     try {
//         await apiCall(`/api/user/${userId}`, 'DELETE');
//         alert('Utilisateur supprimé avec succès');
//         loadUsers();
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors de la suppression');
//     }
// }

// // Charger les devices
// async function loadDevices() {
//     try {
//         const response = await apiCall('/api/devices', 'GET');
//         const devices = response.devices || [];

//         const tbody = document.getElementById('devicesBody');
//         tbody.innerHTML = '';

//         devices.forEach(device => {
//             const row = tbody.insertRow();
//             const userName = device.userId ? 
//                 (device.userId.username || 'Utilisateur supprimé') : 
//                 'Non associé';
            
//             row.innerHTML = `
//                 <td><code>${device.deviceId}</code></td>
//                 <td>${device.name}</td>
//                 <td>${device.type}</td>
//                 <td>${userName}</td>
//                 <td><span class="badge ${device.isConnected ? 'badge-success' : 'badge-danger'}">
//                     ${device.isConnected ? 'Connecté' : 'Déconnecté'}
//                 </span></td>
//                 <td>
//                     <button class="btn btn-danger" onclick="deleteDevice('${device.deviceId}')">Supprimer</button>
//                 </td>
//             `;
//         });

//         // Remplir les selects
//         const selectDevice = document.getElementById('selectDevice');
//         const commandDevice = document.getElementById('commandDevice');
        
//         selectDevice.innerHTML = '<option value="">Sélectionner un device</option>';
//         commandDevice.innerHTML = '<option value="">Sélectionner un device</option>';
        
//         devices.forEach(device => {
//             const option1 = document.createElement('option');
//             option1.value = device.deviceId;
//             option1.textContent = `${device.name} (${device.deviceId})`;
//             selectDevice.appendChild(option1);

//             const option2 = document.createElement('option');
//             option2.value = device.deviceId;
//             option2.textContent = `${device.name} (${device.deviceId})`;
//             commandDevice.appendChild(option2);
//         });

//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors du chargement des devices');
//     }
// }

// // Créer un device
// document.getElementById('createDeviceForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const deviceId = document.getElementById('deviceId').value;
//     const name = document.getElementById('deviceName').value;
//     const type = document.getElementById('deviceType').value;

//     try {
//         await apiCall('/api/devices', 'POST', { deviceId, name, type });
//         alert('Device créé avec succès');
//         e.target.reset();
//         loadDevices();
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors de la création du device');
//     }
// });

// // Supprimer un device
// async function deleteDevice(deviceId) {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer ce device ?')) {
//         return;
//     }

//     try {
//         await apiCall(`/api/devices/${deviceId}`, 'DELETE');
//         alert('Device supprimé avec succès');
//         loadDevices();
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors de la suppression');
//     }
// }

// // Associer un device à un utilisateur
// document.getElementById('assignDeviceForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const userId = document.getElementById('selectUser').value;
//     const deviceId = document.getElementById('selectDevice').value;

//     if (!userId || !deviceId) {
//         alert('Veuillez sélectionner un utilisateur et un device');
//         return;
//     }

//     try {
//         await apiCall('/api/user/assign-device', 'POST', { userId, deviceId });
//         alert('Device associé avec succès');
//         e.target.reset();
//         loadUsers();
//         loadDevices();
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur lors de l\'association');
//     }
// });

// // Envoyer une commande
// document.getElementById('sendCommandForm').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const deviceId = document.getElementById('commandDevice').value;
//     const action = document.getElementById('commandAction').value;

//     if (!deviceId || !action) {
//         alert('Veuillez sélectionner un device et une action');
//         return;
//     }

//     try {
//         await apiCall('/api/command', 'POST', { 
//             deviceId, 
//             command: { action } 
//         });
//         alert('Commande envoyée avec succès');
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert(error.message || 'Erreur lors de l\'envoi de la commande');
//     }
// });

// // Charger les données au démarrage
// loadUsers();
// loadDevices();



// Vérifier l'authentification et les permissions
if (!checkAuth()) {
    window.location.href = 'login.html';
}

const currentUser = getCurrentUser();
if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'error.html?error=unauthorized';
}

// Déconnexion
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Charger les utilisateurs
async function loadUsers() {
    try {
        const response = await apiCall('/api/users', 'GET');
        const users = response.users || [];

        const tbody = document.getElementById('usersBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
                <td>${user.devices ? user.devices.length : 0}</td>
                <td>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-success" onclick="promoteToAdmin('${user._id}', '${user.username}')" style="margin-right: 8px;">
                            Promouvoir Admin
                        </button>
                        <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Supprimer</button>
                    ` : '<em>Admin principal</em>'}
                </td>
            `;
        });

        // Remplir le select pour l'association
        const selectUser = document.getElementById('selectUser');
        selectUser.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = `${user.username} (${user.email})`;
            selectUser.appendChild(option);
        });

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des utilisateurs');
    }
}

// Promouvoir un utilisateur à admin
async function promoteToAdmin(userId, username) {
    if (!confirm(`Êtes-vous sûr de vouloir promouvoir ${username} en administrateur ?`)) {
        return;
    }

    try {
        const response = await apiCall(`/api/users/${userId}/promote`, 'PATCH');
        if (response.success) {
            alert(`${username} est maintenant administrateur !`);
            loadUsers();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la promotion');
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    try {
        await apiCall(`/api/users/${userId}`, 'DELETE');
        alert('Utilisateur supprimé avec succès');
        loadUsers();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// Charger les devices
async function loadDevices() {
    try {
        const response = await apiCall('/api/devices', 'GET');
        const devices = response.devices || [];

        const tbody = document.getElementById('devicesBody');
        tbody.innerHTML = '';

        devices.forEach(device => {
            const row = tbody.insertRow();
            const userName = device.userId ? 
                (device.userId.username || 'Utilisateur supprimé') : 
                'Non associé';
            
            row.innerHTML = `
                <td><code>${device.deviceId}</code></td>
                <td>${device.name}</td>
                <td>${device.type}</td>
                <td>${userName}</td>
                <td><span class="badge ${device.isConnected ? 'badge-success' : 'badge-danger'}">
                    ${device.isConnected ? 'Connecté' : 'Déconnecté'}
                </span></td>
                <td>
                    <button class="btn btn-danger" onclick="deleteDevice('${device.deviceId}')">Supprimer</button>
                </td>
            `;
        });

        // Remplir les selects
        const selectDevice = document.getElementById('selectDevice');
        const commandDevice = document.getElementById('commandDevice');
        const filterDevice = document.getElementById('filterDevice');
        
        selectDevice.innerHTML = '<option value="">Sélectionner un device</option>';
        commandDevice.innerHTML = '<option value="">Sélectionner un device</option>';
        filterDevice.innerHTML = '<option value="">Tous les devices</option>';
        
        devices.forEach(device => {
            const option1 = document.createElement('option');
            option1.value = device.deviceId;
            option1.textContent = `${device.name} (${device.deviceId})`;
            selectDevice.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = device.deviceId;
            option2.textContent = `${device.name} (${device.deviceId})`;
            commandDevice.appendChild(option2);

            const option3 = document.createElement('option');
            option3.value = device.deviceId;
            option3.textContent = `${device.name} (${device.deviceId})`;
            filterDevice.appendChild(option3);
        });

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des devices');
    }
}

// Créer un device
document.getElementById('createDeviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const deviceId = document.getElementById('deviceId').value;
    const name = document.getElementById('deviceName').value;
    const type = document.getElementById('deviceType').value;

    try {
        await apiCall('/api/devices', 'POST', { deviceId, name, type });
        alert('Device créé avec succès');
        e.target.reset();
        loadDevices();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du device');
    }
});

// Supprimer un device
async function deleteDevice(deviceId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce device ?')) {
        return;
    }

    try {
        await apiCall(`/api/devices/${deviceId}`, 'DELETE');
        alert('Device supprimé avec succès');
        loadDevices();
        loadMeasurements();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

// Associer un device à un utilisateur
document.getElementById('assignDeviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('selectUser').value;
    const deviceId = document.getElementById('selectDevice').value;

    if (!userId || !deviceId) {
        alert('Veuillez sélectionner un utilisateur et un device');
        return;
    }

    try {
        await apiCall('/api/users/assign-device', 'POST', { userId, deviceId });
        alert('Device associé avec succès');
        e.target.reset();
        loadUsers();
        loadDevices();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'association');
    }
});

// Envoyer une commande
document.getElementById('sendCommandForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const deviceId = document.getElementById('commandDevice').value;
    const action = document.getElementById('commandAction').value;

    if (!deviceId || !action) {
        alert('Veuillez sélectionner un device et une action');
        return;
    }

    try {
        await apiCall('/api/command', 'POST', { 
            deviceId, 
            command: { action } 
        });
        alert('Commande envoyée avec succès');
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Erreur lors de l\'envoi de la commande');
    }
});

// Charger les mesures avec filtres
async function loadMeasurements() {
    try {
        const deviceId = document.getElementById('filterDevice').value;
        const userId = document.getElementById('filterUser').value;
        const limit = document.getElementById('limitFilter').value || 100;

        let endpoint = `/api/measurements?limit=${limit}`;
        if (deviceId) endpoint += `&deviceId=${deviceId}`;
        if (userId) endpoint += `&userId=${userId}`;

        const response = await apiCall(endpoint, 'GET');
        const measurements = response.measurements || [];

        const tbody = document.getElementById('measurementsBody');
        tbody.innerHTML = '';

        if (measurements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucune mesure trouvée</td></tr>';
            return;
        }

        measurements.forEach(measurement => {
            const row = tbody.insertRow();
            const userName = measurement.userId ? measurement.userId.username : 'N/A';
            row.innerHTML = `
                <td><code>${measurement.deviceId}</code></td>
                <td>${userName}</td>
                <td><strong>${measurement.value}</strong></td>
                <td>${measurement.unit || 'celsius'}</td>
                <td>${formatDate(measurement.timestamp)}</td>
            `;
        });

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des mesures');
    }
}

// Charger les données au démarrage
loadUsers();
loadDevices();
loadMeasurements();

// Actualiser automatiquement les mesures toutes les 30 secondes
setInterval(loadMeasurements, 30000);