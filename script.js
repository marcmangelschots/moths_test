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

    async function loadData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            itemsData = data.items;
            console.log("Items data geladen:", itemsData);
            displayLevelButtons();
        } catch (error) {
            console.error("Fout bij het laden van de data:", error);
            feedbackElement.textContent = "Er is een fout opgetreden bij het laden van de quizdata.";
        }
    }

    function displayLevelButtons() {
        const buttons = levelButtonsDiv.querySelectorAll('table button');
        buttons.forEach(button => {
            const itemsRange = button.dataset.items;
            button.addEventListener('click', () => {
                console.log("startQuiz functie uitgevoerd"); // Debugging
                startQuiz(itemsRange);
            });

            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');
            const [start, end] = itemsRange.split('-').map(Number);
            const relevantItems = itemsData.filter(item => parseInt(item.id.replace('item', '')) >= start && parseInt(item.id.replace('item', '')) <= end);
            if (relevantItems.length > 0) {
                const itemList = document.createElement('ul');
                relevantItems.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.textContent = item.labels[0];
                    itemList.appendChild(listItem);
                });
                tooltip.appendChild(itemList);
                const buttonContainer = button.parentNode;
                if (buttonContainer && buttonContainer.classList.contains('button-container')) {
                    buttonContainer.appendChild(tooltip);
                }
            }
        });
    }

    function startQuiz(itemsRange) {
        const [start, end] = itemsRange.split('-').map(Number);
        currentLevelItems = itemsData.filter(item => parseInt(item.id.replace('item', '')) >= start && parseInt(item.id.replace('item', '')) <= end);

        console.log("Geselecteerde items voor quiz:", currentLevelItems);

        if (currentLevelItems.length === 0) {
            feedbackElement.textContent = "Er zijn geen items beschikbaar voor dit bereik.";
            return;
        }

        levelSelectionDiv.style.display = 'none';
        quizContainer.style.display = 'block';
        console.log("Quiz container display:", quizContainer.style.display);
        currentQuestionIndex = 0;
        userScore = 0;
        feedbackElement.textContent = ''; // Reset feedback
        scoreElement.textContent = '';    // Reset score

        // Verwijder eventueel de "Terug naar startscherm" knop als deze nog aanwezig is
        const existingRestartButton = quizContainer.querySelector('button:not(#next-question)');
        if (existingRestartButton) {
            quizContainer.removeChild(existingRestartButton);
        }

        console.log("loadQuestion functie uitgevoerd");
        loadQuestion();
    }

    function loadQuestion() {
        console.log("Load question aangeroepen. Index:", currentQuestionIndex);
        console.log("Current level items:", currentLevelItems);
    
        if (currentQuestionIndex >= 10) {
            showScore();
            return;
        }
    
        const availableItems = [...currentLevelItems];
        const correctItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        currentQuestion = correctItem;
        console.log("Huidige vraag:", currentQuestion);
        console.log("Net voor instellen afbeelding:", currentQuestion);
    
        if (currentQuestion) console.log("currentQuestion is truthy");
        if (currentQuestion && currentQuestion.images) console.log("currentQuestion.images is truthy");
        if (currentQuestion && currentQuestion.images && currentQuestion.images.length > 0) {
            console.log("currentQuestion.images.length > 0 is true");
            const randomImage = currentQuestion.images[Math.floor(Math.random() * currentQuestion.images.length)];
            const baseUrl = window.location.origin + '/moths_test/';
            let imagePath = '';
            if (randomImage.startsWith('images/')) {
                imagePath = baseUrl + randomImage;
            } else {
                imagePath = baseUrl + 'images/' + randomImage;
            }
            quizImage.src = imagePath;
            console.log("quizImage.src na instellen:", quizImage.src);
            quizImage.alt = currentQuestion.labels[0];
        } else {
            console.log("Conditie voor afbeelding is false");
            console.error("Geen afbeeldingen gevonden voor item:", currentQuestion);
            quizImage.src = '';
            quizImage.alt = 'Geen afbeelding beschikbaar';
        }
    
        const options = generateOptions(correctItem, availableItems);
        console.log("displayOptions functie uitgevoerd met opties:", options);
        displayOptions(options);
    
        feedbackElement.textContent = '';
        nextButton.style.display = 'none';
    }

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

    function displayOptions(options) {
        optionsContainer.innerHTML = '';
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.addEventListener('click', () => checkAnswer(optionText));
            optionsContainer.appendChild(button);
        });
    }

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

    function showScore() {
        quizContainer.style.display = 'block';
        quizImage.style.display = 'none';
        optionsContainer.innerHTML = '';
        feedbackElement.textContent = `Quiz voltooid! Uw eindscore is: ${userScore} / 10`;
        scoreElement.textContent = '';
        nextButton.style.display = 'none';

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Terug naar startscherm';
        restartButton.addEventListener('click', () => {
            quizContainer.style.display = 'none';
            levelSelectionDiv.style.display = 'block';
            currentQuestionIndex = 0;
            userScore = 0;
            feedbackElement.textContent = '';
            scoreElement.textContent = '';
            quizImage.style.display = 'block';
            // Verwijder de knop weer wanneer we teruggaan naar het startscherm (redundant, maar veilig)
            if (quizContainer.contains(restartButton)) {
                quizContainer.removeChild(restartButton);
            }
        });
        quizContainer.appendChild(restartButton);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
        Array.from(optionsContainer.children).forEach(button => {
            button.disabled = false;
        });
    });

    loadData();
});