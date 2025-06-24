// Variables
let currentDifficulty = null; // Dificultad actual seleccionada
let allImages = Array.from({ length: 16 }, (_, i) => (i + 1).toString()); // Lista de nombres de imágenes (1.png a 16.png)
let emojis = [], shuf_emojis = []; // Arrays para imágenes originales y mezcladas
let firstCard = null, secondCard = null, lockBoard = false; // Control del tablero y selección de cartas
let timerInterval; // Referencia al temporizador
let time = 0, score = 0; // Tiempo y puntaje
const clickSound = new Audio('audio/click.mp3'); // Sonido que se reproduce al hacer clic en una carta

// Función que determina cuántas columnas tendrá el tablero según la dificultad y el tamaño de pantalla
function getColumnsForDifficulty(dificultad) {
    let screenWidth = window.innerWidth;

    switch (dificultad) {
        case 'Fácil':
        case 'Medio':
            return 4;
        case 'Difícil':
            return screenWidth <= 600 ? 4 : 6;
        case 'Tryhard':
            return screenWidth <= 600 ? 4 : 8;
        default:
            return 6;
    }
}

// Inicia el juego según la dificultad seleccionada
function startGame(dificultad) {
    currentDifficulty = dificultad;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.game').innerHTML = '';

    let numPairs, timeLimit;

    // Asignar número de pares y límite de tiempo según dificultad
    switch (dificultad) {
        case 'Fácil':
            numPairs = 4;
            timeLimit = 20;
            break;
        case 'Medio':
            numPairs = 8;
            timeLimit = 40;
            break;
        case 'Difícil':
            numPairs = 12;
            timeLimit = 60;
            break;
        case 'Tryhard':
            numPairs = 16;
            timeLimit = 80;
            break;
    }

    document.getElementById('levelDisplay').textContent = `Nivel: ${dificultad}`;

    // Ajustar columnas del tablero
    let columns = getColumnsForDifficulty(dificultad);
    document.querySelector('.game').style.gridTemplateColumns = `repeat(${columns}, auto)`;

    // Preparar las imágenes para el juego (duplicadas y mezcladas)
    emojis = [];
    const selected = allImages.slice(0, numPairs);
    selected.forEach(img => emojis.push(img, img));
    shuf_emojis = emojis.sort(() => Math.random() - 0.5);

    createBoard(); // Crear tablero
    startTimer(timeLimit); // Iniciar temporizador
}

// Crea dinámicamente el tablero con las cartas
function createBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    for (let i = 0; i < shuf_emojis.length; i++) {
        let box = document.createElement('div');
        box.className = 'item';

        let img = document.createElement('img');
        img.src = `img/${shuf_emojis[i]}.png`;
        img.classList.add('hidden-img');

        box.appendChild(img);

        // Evento al hacer clic sobre una carta
        box.onclick = function () {
            if (lockBoard || this.classList.contains('boxOpen') || this.classList.contains('boxMatch')) return;

            clickSound.currentTime = 0;
            clickSound.play(); // Reproducir sonido al hacer clic

            this.classList.add('boxOpen');

            if (!firstCard) {
                firstCard = this;
            } else {
                secondCard = this;
                lockBoard = true;

                setTimeout(() => {
                    // Si ambas cartas coinciden
                    if (firstCard.innerHTML === secondCard.innerHTML) {
                        firstCard.classList.add('boxMatch');
                        secondCard.classList.add('boxMatch');
                        score += 100;
                    } else {
                        // Si no coinciden
                        firstCard.classList.remove('boxOpen');
                        secondCard.classList.remove('boxOpen');
                        score -= 10;
                    }

                    // Actualizar puntaje
                    document.getElementById('score').textContent = `Puntaje: ${score}`;
                    firstCard = null;
                    secondCard = null;
                    lockBoard = false;

                    // Verificar si el jugador ganó (todas las cartas emparejadas)
                    if (document.querySelectorAll('.boxMatch').length === emojis.length) {
                        clearInterval(timerInterval);
                        setTimeout(() => {
                            document.getElementById('gameContainer').style.display = 'none';
                            document.getElementById('victoryScreen').style.display = 'flex';
                            const victoryDetails = document.getElementById('victoryDetails');
                            victoryDetails.classList.add('victory-text');
                            victoryDetails.innerHTML = `Tiempo restante: ${time}s<br>Puntaje: ${score}`;
                        }, 300);
                    }
                }, 500);
            }
        };

        document.querySelector('.game').appendChild(box); // Añadir carta al tablero
    }
}

// Inicia el temporizador de cuenta regresiva
function startTimer(startTime) {
    time = startTime;
    document.getElementById('timer').textContent = `Tiempo: ${time}s`;
    clearInterval(timerInterval); // Detener cualquier temporizador anterior

    timerInterval = setInterval(() => {
        time--;
        document.getElementById('timer').textContent = `Tiempo: ${time}s`;

        if (time <= 0) {
            clearInterval(timerInterval);
            document.getElementById('gameContainer').style.display = 'none';
            document.getElementById('defeatScreen').style.display = 'flex';
        }
    }, 1000);
}

// Ajustar columnas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    if (currentDifficulty) {
        let columns = getColumnsForDifficulty(currentDifficulty);
        document.querySelector('.game').style.gridTemplateColumns = `repeat(${columns}, auto)`;
    }
});

// Reinicia el nivel actual
function restartLevel() {
    clearInterval(timerInterval);
    score = 0;
    document.getElementById('score').textContent = 'Puntaje: 0';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    startGame(currentDifficulty);
}

// Regresa al menú principal desde cualquier pantalla
function resetGameToMenu() {
    clearInterval(timerInterval);
    document.getElementById('menu').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    document.getElementById('creditsScreen').style.display = 'none';
    score = 0;
    document.getElementById('score').textContent = 'Puntaje: 0';
    document.getElementById('timer').textContent = 'Tiempo: 0s';
}

// Muestra la pantalla de créditos
function showCredits() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('creditsScreen').style.display = 'flex';
}
