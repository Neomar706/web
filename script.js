let currentPage = 1;
let totalPages = 1;
let currentSearch = '';
let currentRace = '';
let allCharacters = [];
let races = new Set();

// Obtener personajes de la API
async function fetchCharacters(page = 1, search = '', race = '') {
    showLoading();

    try {
        let url = `https://dragonball-api.com/api/characters?limit=20&page=${page}`;

        if (search) {
            // Si hay búsqueda, obtenemos todos los personajes y filtramos localmente
            const allData = await fetch('https://dragonball-api.com/api/characters?limit=100');
            const allResult = await allData.json();
            let filtered = allResult.items;

            if (search) {
                filtered = filtered.filter(char =>
                    char.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            if (race) {
                filtered = filtered.filter(char => char.race === race);
            }

            allCharacters = filtered;
            totalPages = Math.ceil(filtered.length / 20);
            const start = (page - 1) * 20;
            const end = start + 20;
            displayCharacters(filtered.slice(start, end));
            displayPagination();
        } else if (race) {
            // Si hay filtro de raza, obtenemos todos y filtramos
            const allData = await fetch('https://dragonball-api.com/api/characters?limit=100');
            const allResult = await allData.json();
            let filtered = allResult.items.filter(char => char.race === race);
            allCharacters = filtered;
            totalPages = Math.ceil(filtered.length / 20);
            const start = (page - 1) * 20;
            const end = start + 20;
            displayCharacters(filtered.slice(start, end));
            displayPagination();
        } else {
            // Sin filtros, obtener página normal
            const response = await fetch(url);
            const data = await response.json();
            allCharacters = data.items;
            totalPages = data.meta.totalPages;
            displayCharacters(data.items);
            displayPagination();

            // Extraer razas únicas
            if (races.size === 0) {
                const allData = await fetch('https://dragonball-api.com/api/characters?limit=100');
                const allResult = await allData.json();
                allResult.items.forEach(char => {
                    if (char.race) races.add(char.race);
                });
                displayRaceFilters();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los personajes');
    }
}

function showLoading() {
    document.getElementById('charactersContainer').innerHTML = '<div class="loading">Cargando personajes...</div>';
}

function showError(message) {
    document.getElementById('charactersContainer').innerHTML = `<div class="error">❌ ${message}</div>`;
}

function displayCharacters(characters) {
    const container = document.getElementById('charactersContainer');

    if (!characters || characters.length === 0) {
        container.innerHTML = '<div class="error">No se encontraron personajes 😢</div>';
        return;
    }

    container.innerHTML = `
                <div class="characters-grid">
                    ${characters.map(char => `
                        <div class="character-card" onclick="showCharacterDetails(${char.id})">
                            <img class="character-image" src="${char.image}" alt="${char.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
                            <div class="character-info">
                                <div class="character-name">${char.name}</div>
                                <div class="character-race">${char.race || 'Desconocida'}</div>
                                <div class="character-details"><strong>Ki:</strong> ${char.ki}</div>
                                <div class="character-details"><strong>Max Ki:</strong> ${char.maxKi}</div>
                                <div class="character-details"><strong>Género:</strong> ${char.gender}</div>
                                <div class="character-details"><strong>Afiliación:</strong> ${char.affiliation}</div>
                                <div class="description">${char.description.substring(0, 100)}${char.description.length > 100 ? '...' : ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
}

function displayPagination() {
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let buttons = [];

    buttons.push(`<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>◀ Anterior</button>`);

    // Mostrar páginas
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            buttons.push(`<button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            buttons.push(`<button class="page-btn disabled">...</button>`);
        }
    }

    buttons.push(`<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente ▶</button>`);

    container.innerHTML = buttons.join('');
}

function displayRaceFilters() {
    const container = document.getElementById('raceFilter');
    const racesArray = Array.from(races).sort();

    container.innerHTML = `
                <button class="race-btn ${currentRace === '' ? 'active' : ''}" onclick="filterByRace('')">Todos</button>
                ${racesArray.map(race => `
                    <button class="race-btn ${currentRace === race ? 'active' : ''}" onclick="filterByRace('${race}')">${race}</button>
                `).join('')}
            `;
}

async function showCharacterDetails(id) {
    try {
        const response = await fetch(`https://dragonball-api.com/api/characters/${id}`);
        const character = await response.json();

        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
                    <img class="modal-image" src="${character.image}" alt="${character.name}" onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'">
                    <div class="modal-info">
                        <h2 style="color: #764ba2; margin-bottom: 10px;">${character.name}</h2>
                        <div style="margin-bottom: 8px;"><strong>Raza:</strong> ${character.race || 'Desconocida'}</div>
                        <div style="margin-bottom: 8px;"><strong>Género:</strong> ${character.gender}</div>
                        <div style="margin-bottom: 8px;"><strong>Ki:</strong> ${character.ki}</div>
                        <div style="margin-bottom: 8px;"><strong>Max Ki:</strong> ${character.maxKi}</div>
                        <div style="margin-bottom: 8px;"><strong>Afiliación:</strong> ${character.affiliation}</div>
                        <div style="margin-top: 15px; line-height: 1.6;"><strong>Descripción:</strong><br>${character.description}</div>
                    </div>
                `;

        document.getElementById('modal').style.display = 'flex';
    } catch (error) {
        console.error('Error al cargar detalles:', error);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    fetchCharacters(currentPage, currentSearch, currentRace);
}

function searchCharacters() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    currentRace = '';
    fetchCharacters(currentPage, currentSearch, '');
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearch = '';
    currentPage = 1;
    currentRace = '';
    fetchCharacters(1, '', '');

    // Resetear botones de raza
    document.querySelectorAll('.race-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === 'Todos') btn.classList.add('active');
    });
}

function filterByRace(race) {
    currentRace = race;
    currentPage = 1;
    currentSearch = '';
    document.getElementById('searchInput').value = '';
    fetchCharacters(1, '', race);

    // Actualizar botones activos
    document.querySelectorAll('.race-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === race || (race === '' && btn.textContent === 'Todos')) {
            btn.classList.add('active');
        }
    });
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// Inicializar
fetchCharacters(1, '', '');