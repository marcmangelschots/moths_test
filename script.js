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
    let currentLevel = null;
    let currentLevelItems = [];
    let currentQuestionIndex = 0;
    let currentQuestion = null;
    let userScore = 0;

    // Functie om de JSON-data te laden
    async function loadData() {
        try {
            const response = await fetch('data.json'); // Zorg ervoor dat 'data.json' in dezelfde map staat of pas het pad aan
            const data = await response.json();
            itemsData = data.items;
            displayLevelButtons(data.levels);
        } catch (error) {
            console.error("Fout bij het laden van de data:", error);
            feedbackElement.textContent = "Er is een fout opgetreden bij het laden van de quizdata.";
        }
    }

    // Functie om de niveauknoppen te tonen
    function displayLevelButtons(levels) {
        levels.forEach(levelInfo => {
            const button = document.createElement('button');
            button.textContent = `Niveau ${levelInfo.level} (${levelInfo.itemCount} items)`;
            button.addEventListener('click', () => startQuiz(levelInfo.level));
            levelButtonsDiv.appendChild(button);
        });
    }

    // Functie om de quiz te starten voor een geselecteerd niveau
    function startQuiz(level) {
        currentLevel = level;
        currentLevelItems = itemsData.filter(item => item.level <= currentLevel);
        if (currentLevelItems.length === 0) {
            feedbackElement.textContent = "Er zijn nog geen items beschikbaar voor dit niveau.";
            return;
        }
        levelSelectionDiv.style.display = 'none';
        quizContainer.style.display = 'block';
        currentQuestionIndex = 0;
        userScore = 0;
        loadQuestion();
    }

    // Functie om een nieuwe vraag te laden
    function loadQuestion() {
        if (currentQuestionIndex >= 10) { // Toon score na 10 vragen
            showScore();
            return;
        }

        // Selecteer willekeurige items voor de huidige vraag en opties (alleen uit het huidige niveau)
        const availableItems = [...currentLevelItems]; // Maak een kopie om manipulatie te voorkomen
        const correctItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        currentQuestion = correctItem;

        // Kies een willekeurige afbeelding van het correcte item
        const randomImage = correctItem.images[Math.floor(Math.random() * correctItem.images.length)];
        quizImage.src = randomImage;
        quizImage.alt = correctItem.labels[0]; // Gebruik het eerste label als alt-tekst

        // Genereer willekeurige opties (inclusief het correcte antwoord)
        const options = generateOptions(correctItem, availableItems);
        displayOptions(options);

        feedbackElement.textContent = ''; // Reset feedback
        nextButton.style.display = 'none';
    }

    // Functie om meerkeuze-opties te genereren
    function generateOptions(correctItem, availableItems) {
        const options = new Set();
        options.add(correctItem.labels[0]); // Voeg het correcte antwoord toe

        while (options.size < 4 && availableItems.length > 1) { // Genereer 3 willekeurige, incorrecte opties
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const randomItem = availableItems[randomIndex];
            if (randomItem.id !== correctItem.id) {
                options.add(randomItem.labels[0]);
            }
            if (options.size < 4 && availableItems.length <= 1) {
                // Als er niet genoeg unieke incorrecte opties zijn, vul aan met het correcte antwoord (kan gebeuren in de vroege levels)
                options.add(correctItem.labels[0]);
            }
        }

        // Zet de Set om naar een array en schud de volgorde
        return shuffleArray(Array.from(options));
    }

    // Functie om de opties op het scherm weer te geven
    function displayOptions(options) {
        optionsContainer.innerHTML = ''; // Leeg de vorige opties
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.addEventListener('click', () => checkAnswer(optionText));
            optionsContainer.appendChild(button);
        });
    }

    // Functie om het gegeven antwoord te controleren
    function checkAnswer(selectedAnswer) {
        if (currentQuestion && currentQuestion.labels.includes(selectedAnswer)) {
            feedbackElement.textContent = 'Correct!';
            userScore++;
        } else {
            feedbackElement.textContent = `Fout. Het correcte antwoord was: ${currentQuestion.labels.join(', ')}`;
        }
        scoreElement.textContent = `Score: ${userScore} / ${currentQuestionIndex + 1}`;
        nextButton.style.display = 'inline-block';
        // Disable answer buttons after answering
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = true;
        });
    }

    // Functie om de score te tonen na de quiz
    function showScore() {
        quizContainer.style.display = 'none';
        feedbackElement.textContent = `Quiz voltooid! Je eindscore is: ${userScore} / 10`;
        scoreElement.textContent = '';
        nextButton.style.display = 'none';
        levelSelectionDiv.style.display = 'block'; // Terug naar niveau selectie (of implementeer automatische doorstroming)

        // Optioneel: Automatisch doorschakelen naar volgend niveau
        if (userScore / 10 >= 0.8 && currentLevel < 6) {
            currentLevel++;
            startQuiz(currentLevel);
        } else if (currentLevel === 6) {
            feedbackElement.textContent += " Je hebt alle items geleerd!";
        } else if (userScore / 10 < 0.8) {
            feedbackElement.textContent += " Probeer dit niveau nog eens of kies een ander niveau.";
        }
    }

    // Functie om een array willekeurig te schudden (Fisher-Yates algoritme)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Event listener voor de "Volgende vraag" knop
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
        // Enable answer buttons for the next question
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = false;
        });
    });

    // Laad de data wanneer de pagina geladen is
    loadData();
});