// Número de tarjetas a mostrar por página
const CARDS_PER_PAGE = 9;
let currentPage = 1;
let vocabData = [];
let filteredData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadVocabularyData();
});

/**
 * Carga y valida los datos desde el archivo JSON
 */
async function loadVocabularyData() {
  try {
    const response = await fetch("js/json/vocabulario.json");
    if (!response.ok) throw new Error("Archivo JSON no encontrado o inválido");

    const data = await response.json();

    if (!Array.isArray(data.categorias)) throw new Error("Estructura JSON inesperada");

    // Filtramos solo tarjetas válidas
    vocabData = data.categorias.filter(isValidCard);
    filteredData = [...vocabData];

    renderCards();
    renderPagination();
    setupCategoryFilters();
    setupSearch();
  } catch (error) {
    console.error("Error cargando el vocabulario:", error.message);
  }
}

/**
 * Valida que cada tarjeta tenga la estructura esperada
 * @param {Object} card 
 * @returns {boolean}
 */
function isValidCard(card) {
  return card &&
    typeof card.nombre === "string" &&
    typeof card.imagen === "string" &&
    typeof card.categoria === "string";
}

/**
 * Sanitiza texto para evitar inyecciones de código (XSS)
 * @param {string} str 
 * @returns {string}
 */
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Renderiza las tarjetas según la página actual y datos filtrados
 */
function renderCards() {
  const container = document.getElementById("vocab-cards");
  container.innerHTML = "";

  if (filteredData.length === 0) {
    container.textContent = "No se encontraron resultados.";
    return;
  }

  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const end = start + CARDS_PER_PAGE;
  const cardsToShow = filteredData.slice(start, end);

  cardsToShow.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "vocab-card";

    const isDisabled = ["intermedio", "avanzado"].includes(card.categoria);
    if (isDisabled) cardDiv.classList.add("disabled");

    const img = document.createElement("img");
    img.src = sanitize(card.imagen);
    img.alt = sanitize(card.nombre);
    img.className = "card-img";

    const namePara = document.createElement("p");
    namePara.textContent = card.nombre;

    cardDiv.appendChild(img);
    cardDiv.appendChild(namePara);

    if (!isDisabled) {
      cardDiv.addEventListener("click", () => {
        localStorage.setItem("temaSeleccionado", card.nombre.toLowerCase());
        window.location.href = "vocabulario.html";
      });
    }

    container.appendChild(cardDiv);
  });
}

/**
 * Renderiza los botones de paginación
 */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / CARDS_PER_PAGE);

  paginationContainer.appendChild(
    createPaginationButton("Anterior", currentPage === 1, () => {
      currentPage--;
      renderCards();
      renderPagination();
    })
  );

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.appendChild(
      createPaginationButton(i, i === currentPage, () => {
        currentPage = i;
        renderCards();
        renderPagination();
      })
    );
  }

  paginationContainer.appendChild(
    createPaginationButton("Siguiente", currentPage === totalPages, () => {
      currentPage++;
      renderCards();
      renderPagination();
    })
  );
}

/**
 * Crea un botón de paginación
 * @param {string|number} label 
 * @param {boolean} disabled 
 * @param {Function} onClick 
 * @returns {HTMLButtonElement}
 */
function createPaginationButton(label, disabled, onClick) {
  const button = document.createElement("button");
  button.textContent = label;

  if (disabled) {
    button.disabled = true;
  } else {
    button.addEventListener("click", onClick);
  }

  if (label === currentPage) button.classList.add("active");

  return button;
}

/**
 * Configura el buscador de tarjetas
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    filteredData = vocabData.filter(card =>
      card.nombre.toLowerCase().includes(searchTerm)
    );

    currentPage = 1;
    renderCards();
    renderPagination();
  });
}

/**
 * Configura los filtros por categoría
 */
function setupCategoryFilters() {
  const categoryButtons = document.querySelectorAll(".category-btn");

  // Desactiva botones de categorías que no se deben usar
  ["intermedio", "avanzado"].forEach(cat => {
    const btn = document.querySelector(`.category-btn[data-category='${cat}']`);
    if (btn) btn.disabled = true;
  });

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedCategory = button.getAttribute("data-category");

      filteredData = (selectedCategory === "todos")
        ? [...vocabData]
        : vocabData.filter(card => card.categoria === selectedCategory);

      currentPage = 1;
      renderCards();
      renderPagination();
    });
  });
}
