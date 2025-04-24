document.addEventListener('DOMContentLoaded', () => {
    const levelSelectionDiv = document.getElementById('level-selection');
    const levelButtonsDiv = document.getElementById('level-buttons');
    const quizContainer = document.getElementById('quiz-container');
    const quizImage = document.getElementById('quiz-image');
    const optionsContainer = document.getElementById('options-container');
    const submitButton = document.getElementById('submit-answer');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');
    const nextButton = document.getElementById('next-question');

    let itemsData = [];
    let currentLevelItems = [];
    let currentQuestionIndex = 0;
    let currentQuestion = null;
    let userScore = 0;

    // Functie om de JSON-data te laden
    async function loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            itemsData = data.items;
            displayLevelButtons(); // Roep displayLevelButtons zonder argumenten aan
        } catch (error) {
            console.error("Fout bij het laden van de data:", error);
            feedbackElement.textContent = "Er is een fout opgetreden bij het laden van de quizdata.";
        }
    }

    // Functie om de niveauknoppen te tonen en hover-informatie toe te voegen
    function displayLevelButtons() {
        levelButtonsDiv.innerHTML = ''; // Leeg de bestaande knoppen

        const createButton = (text, itemsRange) => {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');

            const button = document.createElement('button');
            button.textContent = text;
            button.dataset.items = itemsRange; // Stel de data-items in
            button.addEventListener('click', () => startQuiz(itemsRange));

            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');

            const [start, end] = itemsRange.split('-').map(Number);
            const relevantItems = itemsData.filter(item => {
                const itemNumber = parseInt(item.id.replace('item', ''));
                return itemNumber >= start && itemNumber <= end;
            });

            if (relevantItems.length > 0) {
                const itemList = document.createElement('ul');
                relevantItems.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.textContent = item.labels[0];
                    itemList.appendChild(listItem);
                });
                tooltip.appendChild(itemList);
                buttonContainer.appendChild(tooltip);
            }

            buttonContainer.appendChild(button);
            levelButtonsDiv.appendChild(buttonContainer);
        };

        // Eerste kolom
        const column1 = document.createElement('div');
        column1.classList.add('button-column');
        createButton("Motjes 1 - 5", "1-5");
        createButton("Motjes 6 - 10", "6-10");
        createButton("Motjes 11 - 15", "11-15");
        createButton("Motjes 16 - 20", "16-20");
        createButton("Motjes 21 - 25", "21-25");
        createButton("Motjes 26 - 30", "26-30");
        column1.querySelectorAll('.button-container').forEach(bc => levelButtonsDiv.appendChild(bc));

        // Tweede kolom
        const column2 = document.createElement('div');
        column2.classList.add('button-column');
        createButton("Motjes 1 - 10", "1-10");
        createButton("Motjes 6 - 15", "6-15");
        createButton("Motjes 16 - 25", "16-25");
        createButton("Motjes 21 - 30", "21-30");
        column2.querySelectorAll('.button-container').forEach(bc => levelButtonsDiv.appendChild(bc));

        // Derde rij
        const row3 = document.createElement('div');
        row3.classList.add('button-row');
        createButton("Motjes 1 - 15", "1-15");
        createButton("Motjes 16 - 30", "16-30");
        row3.querySelectorAll('.button-container').forEach(bc => levelButtonsDiv.appendChild(bc));

        levelButtonsDiv.appendChild(column1);
        levelButtonsDiv.appendChild(column2);
        levelButtonsDiv.appendChild(row3);
    }

    // Functie om de quiz te starten op basis van het geselecteerde itembereik
    function startQuiz(itemsRange) {
        const [start, end] = itemsRange.split('-').map(Number);
        currentLevelItems = itemsData.filter(item => {
            const itemNumber = parseInt(item.id.replace('item', ''));
            return itemNumber >= start && itemNumber <= end;
        });

        if (currentLevelItems.length === 0) {
            feedbackElement.textContent = "Er zijn geen items beschikbaar voor dit bereik.";
            return;
        }

        levelSelectionDiv.style.display = 'none';
        quizContainer.style.display = 'block';
        currentQuestionIndex = 0;
        userScore = 0;
        loadQuestion();
    }

    // Functie om een nieuwe vraag te laden (blijft grotendeels hetzelfde)
    function loadQuestion() {
        if (currentQuestionIndex >= 10) { // Toon score na 10 vragen
            showScore();
            return;
        }

        const availableItems = [...currentLevelItems];
        const correctItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        currentQuestion = correctItem;

        const randomImage = correctItem.images[Math.floor(Math.random() * correctItem.images.length)];
        quizImage.src = randomImage;
        quizImage.alt = correctItem.labels[0];

        const options = generateOptions(correctItem, availableItems);
        displayOptions(options);

        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
    }

    // Functie om meerkeuze-opties te genereren (blijft grotendeels hetzelfde)
    function generateOptions(correctItem, availableItems) {
        const options = new Set();
        options.add(correctItem.labels[0]);

        while (options.size < 4 && availableItems.length > 1) {
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const randomItem = availableItems[randomIndex];
            if (randomItem.id !== correctItem.id) {
                options.add(randomItem.labels[0]);
            }
            if (options.size < 4 && availableItems.length <= 1) {
                options.add(correctItem.labels[0]);
            }
        }

        return shuffleArray(Array.from(options));
    }

    // Functie om de opties op het scherm weer te geven (blijft grotendeels hetzelfde)
    function displayOptions(options) {
        optionsContainer.innerHTML = '';
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.addEventListener('click', () => checkAnswer(optionText));
            optionsContainer.appendChild(button);
        });
    }

    // Functie om het gegeven antwoord te controleren (blijft hetzelfde)
    function checkAnswer(selectedAnswer) {
        if (currentQuestion && currentQuestion.labels.includes(selectedAnswer)) {
            feedbackElement.textContent = 'Correct!';
            userScore++;
        } else {
            feedbackElement.textContent = `Fout. Het correcte antwoord was: ${currentQuestion.labels.join(', ')}`;
        }
        scoreElement.textContent = `Score: ${userScore} / ${currentQuestionIndex + 1}`;
        nextButton.style.display = 'inline-block';
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
        });
    }

    // Functie om de score te tonen na de quiz (blijft hetzelfde)
    function showScore() {
        quizContainer.style.display = 'none';
        feedbackElement.textContent = `Quiz voltooid! Je eindscore is: ${userScore} / 10`;
        scoreElement.textContent = '';
        nextButton.style.display = 'none';
        levelSelectionDiv.style.display = 'block'; // Terug naar niveau selectie
    }

    // Functie om een array willekeurig te schudden (blijft hetzelfde)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Event listener voor de "Volgende vraag" knop (blijft hetzelfde)
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = false;
        });
    });

    // Laad de data wanneer de pagina geladen is
    loadData();
});