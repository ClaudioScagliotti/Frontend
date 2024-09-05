// Oggetto per memorizzare gli esercizi e le sessioni
let workoutData = JSON.parse(localStorage.getItem('workoutData')) || {
    bicipiti: [],
    tricipiti: [],
    schiena: [],
    spalle: [],
    petto: [],
    gambe: []
};

let currentSection = '';
let currentExercise = '';

// Mostra la sezione selezionata
function showSection(section) {
    currentSection = section;
    document.getElementById('sectionTitle').innerText = section.charAt(0).toUpperCase() + section.slice(1);
    document.getElementById('exerciseSection').style.display = 'block';
    document.getElementById('exerciseDetails').style.display = 'none';
    renderExerciseList();
}

// Mostra la lista degli esercizi
function renderExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    workoutData[currentSection].forEach((exercise, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${exercise.name}</strong>
            ${exercise.description ? `<p>${exercise.description}</p>` : ''}
            <span class="deleteExercise" onclick="deleteExercise(${index})">&times;</span>
        `;
        li.onclick = () => showExerciseDetails(index);
        exerciseList.appendChild(li);
    });
}



// Aggiunge un nuovo esercizio alla sezione corrente
function addExercise() {
    const exerciseName = prompt("Inserisci il nome dell'esercizio:");
    const exerciseDescription = prompt("Inserisci una descrizione facoltativa (premi Annulla per saltare):");

    if (exerciseName) {
        workoutData[currentSection].push({
            name: exerciseName, 
            description: exerciseDescription || "", 
            history: []
        });
        saveData();
        renderExerciseList();
    }
}

function editExercise() {
    const newName = prompt("Modifica il nome dell'esercizio:", workoutData[currentSection][currentExercise].name);
    const newDescription = prompt("Modifica la descrizione dell'esercizio:", workoutData[currentSection][currentExercise].description || '');
    
    if (newName) {
        workoutData[currentSection][currentExercise].name = newName;
    }

    if (newDescription) {
        workoutData[currentSection][currentExercise].description = newDescription;
    }
    
    saveData();
    showExerciseDetails(currentExercise); // Ricarica i dettagli aggiornati
}

// Mostra i dettagli di un esercizio
function showExerciseDetails(exerciseIndex) {
    currentExercise = exerciseIndex;
    document.getElementById('exerciseTitle').innerText = workoutData[currentSection][exerciseIndex].name;
    document.getElementById('exerciseDescription').innerText = workoutData[currentSection][exerciseIndex].description || 'Nessuna descrizione';
    document.getElementById('exerciseDetails').style.display = 'block';
    renderHistoryList();
}

// Mostra la cronologia delle sessioni con pulsanti "Modifica"
function renderHistoryList() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    workoutData[currentSection][currentExercise].history.forEach((session, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            Ripetizioni: ${session.reps}, Peso: ${session.weight}kg, Data: ${session.date} 
            <button onclick="editSession(${index})">Modifica</button>
            <span class="deleteSession" onclick="deleteSession(${index})">&times;</span>`;
        historyList.appendChild(li);
    });
}

// Modifica una sessione
function editSession(sessionIndex) {
    const newReps = prompt("Modifica le ripetizioni:", workoutData[currentSection][currentExercise].history[sessionIndex].reps);
    const newWeight = prompt("Modifica il peso:", workoutData[currentSection][currentExercise].history[sessionIndex].weight);
    
    if (newReps) {
        workoutData[currentSection][currentExercise].history[sessionIndex].reps = newReps;
    }

    if (newWeight) {
        workoutData[currentSection][currentExercise].history[sessionIndex].weight = newWeight;
    }
    
    saveData();
    renderHistoryList(); // Ricarica la lista delle sessioni aggiornata
}


// Salva una nuova sessione di allenamento
function saveSession() {
    const reps = document.getElementById('reps').value;
    const weight = document.getElementById('weight').value;
    if (reps && weight) {
        workoutData[currentSection][currentExercise].history.push({
            reps: reps,
            weight: weight,
            date: new Date().toLocaleDateString()
        });
        saveData();
        renderHistoryList();
    }
}

// Elimina un esercizio
function deleteExercise(exerciseIndex) {
    workoutData[currentSection].splice(exerciseIndex, 1);
    saveData();
    renderExerciseList();
    document.getElementById('exerciseDetails').style.display = 'none';
}

// Elimina una sessione
function deleteSession(sessionIndex) {
    workoutData[currentSection][currentExercise].history.splice(sessionIndex, 1);
    saveData();
    renderHistoryList();
}

// Salva i dati nel localStorage
function saveData() {
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
}


document.addEventListener('deviceready', function() {
    console.log('Device ready');
    document.getElementById('exportButton').addEventListener('click', function() {
        console.log('Bottone export cliccato'); // Log per verificare che il click venga rilevato

        // Chiede l'indirizzo email all'utente
        const recipientEmail = prompt("Inserisci l'indirizzo email a cui inviare i dati:");
        
        // Verifica che l'email non sia vuota
        if (recipientEmail && recipientEmail.includes("@")) {
            // Recupera tutti i dati dal localStorage
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }

            // Converti i dati in una stringa JSON
            const dataStr = JSON.stringify(data, null, 2);

            // Crea un blob con i dati
            const blob = new Blob([dataStr], { type: 'application/json' });
            
            // Converti il blob in un URL temporaneo
            const url = URL.createObjectURL(blob);

            // Utilizza il plugin per inviare l'email
            cordova.plugins.email.isAvailable(function(isAvailable) {
                console.log('Email service availability: ', isAvailable);
                if (isAvailable) {
                    cordova.plugins.email.open({
                        to: recipientEmail, // Usa l'email fornita dall'utente
                        subject: 'Backup dati app',
                        body: 'In allegato trovi i dati del localStorage esportati dall\'app.',
                        attachments: [url]
                    });
                } else {
                    alert('Il servizio email non è disponibile.');
                }
            });
        } else {
            alert('Indirizzo email non valido.');
        }
    });
}, false);


