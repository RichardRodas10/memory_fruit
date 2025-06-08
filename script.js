let currentDifficulty = null;
let allImages = Array.from({ length: 16 }, (_, i) => (i + 1).toString());
let emojis = [], shuf_emojis = [];
let firstCard = null, secondCard = null, lockBoard = false;
let timerInterval;
let time = 0, score = 0;

// Función que decide columnas según dificultad y ancho de pantalla
function getColumnsForDifficulty(dificultad) {
    let screenWidth = window.innerWidth;

    switch (dificultad) {
        case 'Fácil':
            return 4;
        case 'Medio':
            return 4;
        case 'Difícil':
            // Si es móvil (ancho <= 600px), 6 columnas, si no 4 columnas
            return screenWidth <= 600 ? 4 : 6;
        case 'Tryhard':
            // Si es móvil (ancho <= 600px), 6 columnas, si no 4 columnas
        return screenWidth <= 600 ? 4 : 8;
        default:
            return 6;
    }
}

function startGame(dificultad) {
    currentDifficulty = dificultad;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.querySelector('.game').innerHTML = '';

    let numPairs, bgColor, timeLimit;

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

    // Aquí uso la función para obtener columnas dinámicamente
    let columns = getColumnsForDifficulty(dificultad);
    document.querySelector('.game').style.gridTemplateColumns = `repeat(${columns}, auto)`;

    emojis = [];
    const selected = allImages.slice(0, numPairs);
    selected.forEach(img => {
        emojis.push(img, img);
    });

    shuf_emojis = emojis.sort(() => Math.random() - 0.5);

    createBoard();
    startTimer(timeLimit);
}

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

        box.onclick = function () {
            if (lockBoard || this.classList.contains('boxOpen') || this.classList.contains('boxMatch')) return;

            this.classList.add('boxOpen');

            if (!firstCard) {
                firstCard = this;
            } else {
                secondCard = this;
                lockBoard = true;

                setTimeout(() => {
                    if (firstCard.innerHTML === secondCard.innerHTML) {
                        firstCard.classList.add('boxMatch');
                        secondCard.classList.add('boxMatch');
                        score += 100;
                        document.getElementById('score').textContent = `Puntaje: ${score}`;
                    } else {
                        firstCard.classList.remove('boxOpen');
                        secondCard.classList.remove('boxOpen');
                        score -= 10;
                        document.getElementById('score').textContent = `Puntaje: ${score}`;
                    }

                    firstCard = null;
                    secondCard = null;
                    lockBoard = false;

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

        document.querySelector('.game').appendChild(box);
    }
}

function startTimer(startTime) {
    time = startTime;
    document.getElementById('timer').textContent = `Tiempo: ${time}s`;
    clearInterval(timerInterval);
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

// Escuchar cambio de tamaño para ajustar columnas si es necesario
window.addEventListener('resize', () => {
    if (currentDifficulty) {
        let columns = getColumnsForDifficulty(currentDifficulty);
        document.querySelector('.game').style.gridTemplateColumns = `repeat(${columns}, auto)`;
    }
});

// Botón para reiniciar el nivel actual
function restartLevel() {
    clearInterval(timerInterval);
    score = 0;
    document.getElementById('score').textContent = 'Puntaje: 0';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    startGame(currentDifficulty);
}

// Botón para volver al menú
function resetGameToMenu() {
    clearInterval(timerInterval);
    document.getElementById('menu').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    score = 0;
    document.getElementById('score').textContent = 'Puntaje: 0';
    document.getElementById('timer').textContent = 'Tiempo: 0s';
}