//objet selectors pour stocker les variables
const selectors = {
    boardcontainer: document.querySelector(".board_container"),
    board: document.querySelector(".board"),
    moves: document.querySelector(".moves"),
    timer: document.querySelector(".timer"),
    start: document.querySelector("button"),
    win: document.querySelector(".win")
};

//Etat initial du jeu
const state = {
    gameStarted: false, //permet de savoir si le jeu a commencer ou pas
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

// Cette fonction prend un tableau en entrée et renvoie un nouveau tableau contenant les mêmes éléments, mais dans un ordre aléatoire.
const shuffle = array => {
    // Cloner le tableau d'entrée
    const clonnedArray = [...array];

    // Itérer sur chaque élément du tableau, à partir du dernier jusqu'au deuxième élément
    for (let i = clonnedArray.length - 1; i > 0; i--) {
        // Générer un index aléatoire entre 0 et i inclusivement
        const randomIndex = Math.floor(Math.random() * (i + 1));
        // Stocker temporairement l'élément à la position i
        const original = clonnedArray[i];

        // Remplacer l'élément à la position i par l'élément à l'index aléatoire
        clonnedArray[i] = clonnedArray[randomIndex];
        // Déplacer l'élément temporaire à la position de l'index aléatoire
        clonnedArray[randomIndex] = original;
    }
    return clonnedArray;
}


// Cette fonction prend un tableau en entrée et renvoie un tableau contenant un nombre donné d'éléments choisis au hasard à partir du tableau d'entrée.
// Le deuxième argument est le nombre d'éléments à retourner.
const pickRandom = (array, items) => {
    // Cloner le tableau d'entrée pour éviter de le modifier
    const clonnedArray = [...array];
    // Initialiser un tableau vide pour stocker les éléments choisis au hasard
    const randomPicks = [];

    // Répéter le nombre de fois donné dans l'argument "items"
    for (let i = 0; i < items; i++) {
        // Générer un index aléatoire entre 0 et la longueur du tableau cloné
        const randomIndex = Math.floor(Math.random() * clonnedArray.length);

        // Ajouter l'élément correspondant à l'index aléatoire dans le tableau "randomPicks"
        randomPicks.push(clonnedArray[randomIndex]);
        // Supprimer l'élément ajouté du tableau cloné pour éviter de le sélectionner à nouveau
        clonnedArray.splice(randomIndex, 1);
    }
    return randomPicks;
}


// Cette fonction génère un jeu de mémoire et renvoie une chaîne de caractères HTML représentant le tableau de jeu.
const generateGame = () => {
    // Obtenir les dimensions du tableau de jeu à partir de l'attribut "data-dimension" de l'élément "board" sélectionné
    const dimensions = selectors.board.getAttribute('data-dimension');

    // Vérifier si les dimensions sont un nombre pair, sinon lancer une erreur
    if (dimensions % 2 !== 0) {
        throw new Error("Les dimensions du tableau doivent être un nombre pair.")
    }

    // Initialiser un tableau contenant les emojis à utiliser pour le jeu
    const emojis = ['🤣', '😭', '😂', '💀', '🥺', '😌', '😆', '🤔', '🥰', '😒'];
    // Sélectionner un nombre d'éléments au hasard à partir du tableau "emojis", en utilisant la fonction "pickRandom"
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    // Concaténer le tableau de "picks" avec lui-même pour créer deux exemplaires de chaque élément, puis mélanger les éléments en utilisant la fonction "shuffle"
    const items = shuffle([...picks, ...picks]);
    // Créer une chaîne de caractères HTML représentant le tableau de jeu en utilisant les éléments mélangés
    const cards = `
    <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
        ${items.map(item => `
            <div class="card">
                <div class="card-front"></div>
                <div class="card-back">${item}</div>
            </div>
        `).join('')}
    </div>
`;
    // Renvoyer la chaîne de caractères HTML représentant le tableau de jeu
    return cards;
}



const parser = new DOMParser().parseFromString(cards, 'text/html');
selectors.board.replaceWith(parser.querySelector('.board'));

// Démarre le jeu et met à jour l'état du jeu
const startGame = () => {
    // Définir l'état du jeu comme étant commencé
    state.gameStarted = true;
    // Ajouter la classe "disabled" au bouton de démarrage pour le désactiver
    selectors.start.classList.add('disabled');

    // Mettre à jour l'état du temps toutes les secondes en utilisant setInterval
    state.loop = setInterval(() => {
        // Incrémenter le temps total
        state.totalTime++;
        // Mettre à jour l'affichage du nombre de mouvements et du temps total
        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `Time : ${state.totalTime} sec`
    }, 1000)
}

// Retourne toutes les cartes qui ne sont pas des paires correspondantes après un certain délai
const flipBackCards = () => {
    // Utiliser setTimeout pour attendre un certain délai avant de retourner les cartes
    setTimeout(() => {
        // Parcourir toutes les cartes qui ne sont pas encore retournées en enlevant la classe "flipped"
        document.querySelectorAll('.card:not(.matched)').forEach(card => {
            card.classList.remove('flipped');
        });
        // Réinitialiser le nombre de cartes retournées
        state.flippedCards = 0;
    }, 2500);
}


const flipCard = card => {
    // Incrémenter le nombre de cartes retournées et le nombre total de flips
    state.flippedCards++;
    state.totalFlips++;

    // Démarrer le jeu s'il n'a pas encore commencé
    if (!state.gameStarted) {
        startGame();
    }
    // Retourner la carte si le nombre de cartes retournées est inférieur ou égal à 2
    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }
    // Vérifier si deux cartes ont été retournées et si elles sont identiques
    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards[0].innerText === flippedCards[1].innerText) {
            // Ajouter la classe 'matched' aux cartes si elles sont identiques
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }
        // Retourner les cartes s'il n'y a pas de correspondance
        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
    // Vérifier si toutes les cartes ont été retournées
    if (!document.querySelectorAll('.card:not(flipped)').length) {
        // Annoncer la victoire et afficher le nombre total de flips et le temps écoulé
        setTimeout(() => {
            selectors.boardcontainer.classList.add('flipped')
            selectors.win.innerHTML = ` <span class="win-text"> You won! <br/> With  <span class="highlight">${state.totalFlips}</span> moves <br/> under <span class"highlight">${state.totalTime}</span></span>`
            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame();
        }
    })
}

generateGame();
attachEventListeners();