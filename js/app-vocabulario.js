document.addEventListener("DOMContentLoaded", () => {
  // Recupera el tema seleccionado desde el almacenamiento local
  const tema = localStorage.getItem("temaSeleccionado");

  // Si no hay tema seleccionado, redirige al usuario
  if (!tema || typeof tema !== "string") {
    alert("No se ha seleccionado un tema válido.");
    window.location.href = "index.html";
    return;
  }

  // Asigna el tema al título
  const titulo = document.getElementById("titulo-tema");
  if (titulo) {
    titulo.textContent = `Tema: ${tema.charAt(0).toUpperCase() + tema.slice(1)}`;
  }

  // Limpia el nombre del archivo JSON (minimiza el riesgo de manipulación)
  const temaFormateado = tema.toLowerCase().trim().replace(/[^\w]/g, "");
  const jsonFile = `js/json/basico/${temaFormateado}.json`;

  let data = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  // Carga el archivo JSON de forma segura
  fetch(jsonFile)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(jsonData => {
      if (!Array.isArray(jsonData)) {
        throw new Error("El archivo JSON no contiene un arreglo.");
      }
      data = jsonData;
      renderTable();
      renderPagination();
    })
    .catch(error => {
      console.error("Error al cargar el archivo JSON:", error);
      alert("Hubo un problema al cargar el tema. Intenta nuevamente.");
    });

  /**
   * Renderiza la tabla de vocabulario según la página actual.
   */
  function renderTable() {
    const tbody = document.querySelector("#tabla-vocabulario tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = data.slice(start, end);

    itemsToShow.forEach(item => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${sanitizeHTML(item.letter)}</td>
        <td>${sanitizeHTML(item.sound)}</td>
        <td>${sanitizeHTML(item.pronunciacion)}</td>
        <td>
          <button class="btn-escuchar" data-pronunciacion="${sanitizeAttr(item.sound)}">
            🔊 Escuchar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    activarBotonesEscuchar();
  }

  /**
   * Activa los botones de reproducción de audio.
   */
  function activarBotonesEscuchar() {
    const botones = document.querySelectorAll(".btn-escuchar");

    botones.forEach(boton => {
      boton.addEventListener("click", () => {
        const texto = boton.getAttribute("data-pronunciacion");
        if (texto) {
          const utterance = new SpeechSynthesisUtterance(texto);
          utterance.lang = "en-US";
          window.speechSynthesis.speak(utterance);
        }
      });
    });
  }

  /**
   * Renderiza los botones de paginación.
   */
  function renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Botón Anterior
    const prevButton = document.createElement("button");
    prevButton.innerText = "Anterior";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
        renderPagination();
      }
    });
    paginationContainer.appendChild(prevButton);

    // Botones numéricos
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = i === currentPage ? "active" : "";

      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable();
        renderPagination();
      });

      paginationContainer.appendChild(btn);
    }

    // Botón Siguiente
    const nextButton = document.createElement("button");
    nextButton.innerText = "Siguiente";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        renderPagination();
      }
    });
    paginationContainer.appendChild(nextButton);
  }

  /**
   * Sanitiza texto para prevenir inyecciones HTML.
   */
  function sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str || "";
    return temp.innerHTML;
  }

  /**
   * Sanitiza atributos HTML para prevenir inyecciones.
   */
  function sanitizeAttr(str) {
    return String(str || "").replace(/"/g, "&quot;");
  }
});
