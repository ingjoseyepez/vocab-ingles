document.addEventListener("DOMContentLoaded", () => {
    // Obtener el tema seleccionado desde localStorage
    const tema = localStorage.getItem("temaSeleccionado");

    // Si no hay tema, mostrar alerta y redirigir
    if (!tema) {
        alert("Por favor, selecciona un tema antes de continuar.");
        window.location.href = "app.html";
        return;
    }

    // Mostrar el nombre del tema capitalizado en el título
    const titulo = document.getElementById("titulo-tema");
    titulo.textContent = `Has seleccionado: ${tema.charAt(0).toUpperCase() + tema.slice(1)}`;

    // Formatear el nombre del tema para buscar el archivo JSON correcto
    const temaFormateado = tema.toLowerCase().replace(/\s+/g, '');
    const jsonFile = `js/json/basico/${temaFormateado}.json`;

    let matches = [];     // Pares de palabras (ej. letra - sonido)
    let lives = 3;        // Número de vidas
    const pairsContainer = document.getElementById('pairs-container');
    const checkButton = document.getElementById('checkButton');

    // Crear y mostrar contenedor de vidas
    const livesContainer = document.createElement('div');
    livesContainer.id = 'livesContainer';
    const gameContainer = document.querySelector('.game-container');
    gameContainer.insertBefore(livesContainer, pairsContainer);

    // Función para actualizar visualmente las vidas
    function updateLivesDisplay() {
        livesContainer.textContent = `Vidas restantes: ${'❤️'.repeat(lives)}`;
    }

    updateLivesDisplay();

    // Cargar archivo JSON con las palabras
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const totalPairs = 10;
            matches = getRandomItems(data, totalPairs);
            createGamePairs();
        })
        .catch(error => console.log('Error al cargar el archivo JSON:', error));

    // Retorna un subconjunto aleatorio del array
    function getRandomItems(array, count) {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Crea los pares (letras y sonidos) en la interfaz del juego
    function createGamePairs() {
        const letters = [];
        const sounds = [];

        matches.forEach((pair, index) => {
            // Crear elemento de letra
            const letterElement = document.createElement('div');
            letterElement.classList.add('letter');
            letterElement.textContent = pair.letter;
            letterElement.dataset.index = index;
            letterElement.addEventListener('click', () => selectWord(letterElement, 'letter'));

            // Crear elemento de sonido
            const soundElement = document.createElement('div');
            soundElement.classList.add('sound');
            soundElement.textContent = pair.sound;
            soundElement.dataset.index = index;
            soundElement.addEventListener('click', () => selectWord(soundElement, 'sound'));

            letters.push(letterElement);
            sounds.push(soundElement);
        });

        // Barajar y agregar al DOM
        shuffle(letters);
        shuffle(sounds);
        letters.forEach(letter => pairsContainer.appendChild(letter));
        sounds.forEach(sound => pairsContainer.appendChild(sound));
    }

    // Baraja aleatoriamente un array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let selectedLetter = null;
    let selectedSound = null;

    // Función para seleccionar una palabra (letra o sonido)
    function selectWord(element, type) {
        if (type === 'letter') {
            if (selectedLetter && !selectedLetter.classList.contains('matched')) {
                selectedLetter.style.backgroundColor = '#e0e0e0';
                selectedLetter = null;
                return;
            }
            selectedLetter = element;
            highlightSelected(selectedLetter);
        }

        if (type === 'sound') {
            if (selectedSound && !selectedSound.classList.contains('matched')) {
                selectedSound.style.backgroundColor = '#e0e0e0';
                selectedSound = null;
                return;
            }
            selectedSound = element;
            highlightSelected(selectedSound);
        }

        // Verificar coincidencia si ambos están seleccionados
        if (selectedLetter && selectedSound) {
            checkMatch(selectedLetter, selectedSound);
        }
    }

    // Resalta la opción seleccionada
    function highlightSelected(element) {
        element.style.backgroundColor = '#a1c4fd'; // Azul claro
    }

    // Verifica si los dos elementos seleccionados hacen match
    function checkMatch(letter, sound) {
        const letterIndex = letter.dataset.index;
        const soundIndex = sound.dataset.index;

        if (letterIndex === soundIndex) {
            // Es un par correcto
            letter.style.backgroundColor = '#a8e6cf'; // Verde claro
            sound.style.backgroundColor = '#a8e6cf';
            letter.classList.add('matched');
            sound.classList.add('matched');
        } else {
            // No es un par correcto
            lives--;
            updateLivesDisplay();
            letter.style.backgroundColor = '#ff8b94'; // Rojo claro
            sound.style.backgroundColor = '#ff8b94';

            if (lives <= 0) {
                gameOverModal.classList.remove('hidden');
                document.querySelectorAll('.letter, .sound').forEach(el => el.removeEventListener('click', () => {}));
            }
        }

        // Reiniciar la selección después de un breve tiempo
        setTimeout(() => resetSelections(), 1000);
    }

    // Reinicia los elementos seleccionados
    function resetSelections() {
        if (selectedLetter && !selectedLetter.classList.contains('matched')) {
            selectedLetter.style.backgroundColor = '#e0e0e0';
        }
        if (selectedSound && !selectedSound.classList.contains('matched')) {
            selectedSound.style.backgroundColor = '#e0e0e0';
        }
        selectedLetter = null;
        selectedSound = null;
    }

    // Botón para reiniciar los pares sin perder el juego
    checkButton.addEventListener('click', () => {
        pairsContainer.innerHTML = '';
        selectedLetter = null;
        selectedSound = null;
        lives = 3;
        updateLivesDisplay();
        createGamePairs();
    });

    // Botón para reiniciar el juego completo después del game over
    restartButton.addEventListener('click', () => {
        gameOverModal.classList.add('hidden');
        pairsContainer.innerHTML = '';
        selectedLetter = null;
        selectedSound = null;
        lives = 3;
        updateLivesDisplay();
        createGamePairs();
    });
});

