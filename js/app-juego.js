// Número de tarjetas por página
const cardsPerPage = 10;

// Página actual
let currentPage = 1;

// Datos completos y filtrados
let vocabData = [];
let filteredData = [];

/**
 * Carga inicial al terminar de cargar el DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  fetch("js/json/vocabulario.json")
    .then(response => {
      if (!response.ok) throw new Error("Archivo JSON no encontrado o inválido");
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.categorias)) throw new Error("Estructura JSON inesperada");

      vocabData = data.categorias.filter(validCard); // Validar estructura de cada objeto
      filteredData = [...vocabData];
      renderCards();
      renderPagination();
      setupCategoryFilters();
      setupSearch();
    })
    .catch(error => console.error("Error cargando el vocabulario:", error));
});

/**
 * Verifica que el objeto de vocabulario tenga propiedades válidas y seguras
 * @param {Object} card - Objeto de tarjeta
 * @returns {boolean} true si es válido
 */
function validCard(card) {
  return card &&
    typeof card.nombre === "string" &&
    typeof card.imagen === "string" &&
    typeof card.categoria === "string";
}

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} str
 * @returns {string} texto seguro
 */
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Renderiza las tarjetas según la página actual
 */
function renderCards() {
  const container = document.getElementById("vocab-cards");
  container.innerHTML = "";

  if (filteredData.length === 0) {
    container.textContent = "No se encontraron resultados.";
    return;
  }

  const start = (currentPage - 1) * cardsPerPage;
  const cardsToShow = filteredData.slice(start, start + cardsPerPage);

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

    cardDiv.append(img, namePara);

    if (!isDisabled) {
      cardDiv.addEventListener("click", () => {
        localStorage.setItem("temaSeleccionado", sanitize(card.nombre.toLowerCase()));
        window.location.href = "/emparejar.html";
      });
    }

    container.appendChild(cardDiv);
  });
}

/**
 * Renderiza la paginación dinámica
 */
function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / cardsPerPage);

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
 * @param {string|number} label - Texto del botón
 * @param {boolean} disabled - Si está deshabilitado
 * @param {Function} onClick - Acción al hacer clic
 * @returns {HTMLButtonElement} Botón generado
 */
function createPaginationButton(label, disabled, onClick) {
  const button = document.createElement("button");
  button.textContent = label;

  if (label === currentPage) {
    button.className = "active";
  }

  if (disabled) {
    button.disabled = true;
  } else {
    button.addEventListener("click", onClick);
  }

  return button;
}

/**
 * Configura la búsqueda en vivo
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) return;

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
 * Configura los botones de filtro por categoría
 */
function setupCategoryFilters() {
  const categoryButtons = document.querySelectorAll(".category-btn");

  // Desactiva botones no disponibles
  ["intermedio", "avanzado"].forEach(cat => {
    const btn = document.querySelector(`.category-btn[data-category="${cat}"]`);
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
