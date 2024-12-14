// substitutionCipher.js

// Function to generate a random substitution key
function generateSubstitutionKey() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shuffledAlphabet = alphabet.split('').sort(() => Math.random() - 0.5).join('');
    const key = {};
    for (let i = 0; i < alphabet.length; i++) {
        key[alphabet[i]] = shuffledAlphabet[i];
    }
    return key;
}

// Function to format the substitution key into three rows
function formatKey(key) {
    const entries = Object.entries(key);
    const rowLength = Math.ceil(entries.length / 3);
    const formattedRows = [];

    for (let i = 0; i < 3; i++) {
        const rowEntries = entries.slice(i * rowLength, (i + 1) * rowLength);
        const row = rowEntries.map(([letter, mapped]) => `${letter} -> ${mapped}`).join(', ');
        formattedRows.push(row);
    }

    return formattedRows.join('<br>');
}

// Function to encrypt a message using the substitution key
function encryptMessage(message, key) {
    const encrypted = message
        .toUpperCase()
        .split('')
        .map(char => key[char] || char)
        .join('');
    const reversed = encrypted.split('').reverse().join('');
    return reversed;
}

// Function to calculate letter counts, including all letters A-Z
function calculateLetterCounts(message) {
    const counts = {};
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    alphabet.split('').forEach(letter => {
        counts[letter] = 0;
    });
    message.toUpperCase().split('').forEach(char => {
        if (alphabet.includes(char)) {
            counts[char]++;
        }
    });
    return counts;
}

// Function to render counts histogram using Chart.js
function renderCountsChart(canvasId, countsData, chartTitle, barColor, maxCount) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const labels = alphabet.split('');
    const data = labels.map(letter => countsData[letter]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: barColor,
                borderColor: barColor,
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxCount,
                    ticks: { stepSize: 1 },
                    title: {
                        display: true,
                        text: 'Count',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Letters',
                    },
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    color: 'white',
                    font: { size: 16 },
                },
                legend: { display: false },
            },
        },
    });
}

// Set default font color to white for Chart.js
Chart.defaults.color = '#FFFFFF';

// Event listener for 'Generate Key' button
document.getElementById('generateKey').addEventListener('click', () => {
    const key = generateSubstitutionKey();
    const formattedKey = formatKey(key);
    document.getElementById('output').innerHTML = `
        <h4>Substitution Key:</h4>
        <pre style="color: white;">${formattedKey}</pre>
    `;
    window.substitutionKey = key; // Store the key globally
});

// Event listener for 'Encrypt Message' button
document.getElementById('encryptMessage').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    if (!window.substitutionKey) {
        alert('Please generate a substitution key first.');
        return;
    }
    const encryptedMessage = encryptMessage(message, window.substitutionKey);

    // Letter counts
    const originalCounts = calculateLetterCounts(message);
    const encryptedCounts = calculateLetterCounts(encryptedMessage);

    // Find maximum count for y-axis scaling
    const maxCount = Math.max(
        ...Object.values(originalCounts),
        ...Object.values(encryptedCounts)
    ) || 1;

    // Display results and histograms
    document.getElementById('output').innerHTML += `
        <h4>Encrypted Message:</h4>
        <pre style="color: white;">${encryptedMessage}</pre>
        <div class="row">
            <div class="col-md-6">
                <h4>Original Message Letter Counts Histogram</h4>
                <canvas id="originalFrequencyChart"></canvas>
            </div>
            <div class="col-md-6">
                <h4>Encrypted Message Letter Counts Histogram</h4>
                <canvas id="encryptedFrequencyChart"></canvas>
            </div>
        </div>
    `;

    // Render histograms
    renderCountsChart(
        'originalFrequencyChart',
        originalCounts,
        'Original Message Letter Counts',
        'rgba(255, 0, 0, 0.7)', // Red color
        maxCount
    );
    renderCountsChart(
        'encryptedFrequencyChart',
        encryptedCounts,
        'Encrypted Message Letter Counts',
        'rgba(0, 128, 0, 0.7)', // Green color
        maxCount
    );
});

// Function to perform frequency analysis on the reversed encrypted message
function analyzeEncryptedMessage(encryptedMessage) {
    // Reverse the encrypted message to undo the permutation step
    const reversedMessage = encryptedMessage.split('').reverse().join('');

    // Calculate letter counts for the reversed message
    const counts = calculateLetterCounts(reversedMessage);

    // Calculate total letters
    const totalLetters = Object.values(counts).reduce((a, b) => a + b, 0);

    // Calculate frequencies
    const frequencies = {};
    for (let letter in counts) {
        frequencies[letter] = counts[letter] / totalLetters;
    }

    // Standard English letter frequencies
    const englishFrequencies = [
        { letter: 'E', freq: 12.70 },
        { letter: 'T', freq: 9.06 },
        { letter: 'A', freq: 8.17 },
        { letter: 'O', freq: 7.51 },
        { letter: 'I', freq: 6.97 },
        { letter: 'N', freq: 6.75 },
        { letter: 'S', freq: 6.33 },
        { letter: 'H', freq: 6.09 },
        { letter: 'R', freq: 5.99 },
        { letter: 'D', freq: 4.25 },
        { letter: 'L', freq: 4.03 },
        { letter: 'U', freq: 2.76 },
        // Include remaining letters if desired
    ];

    // Sort the letters in the reversed message by frequency
    const sortedEncryptedLetters = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    // Map the most frequent letters in the reversed message to standard frequencies
    const tentativeKey = {};
    for (let i = 0; i < englishFrequencies.length; i++) {
        const encryptedLetter = sortedEncryptedLetters[i];
        if (encryptedLetter) {
            tentativeKey[encryptedLetter] = englishFrequencies[i].letter;
        }
    }

    return {
        reversedMessage,
        counts,
        tentativeKey,
    };
}

// Function to apply the tentative key to decrypt the message partially
function applyTentativeKey(message, tentativeKey) {
    return message
        .split('')
        .map(char => {
            if (/[A-Z]/.test(char)) {
                return tentativeKey[char] || '_';
            } else {
                return char;
            }
        })
        .join('');
}

// Add after analyzeEncryptedMessage function
function updateTentativeKey(currentKey, newMapping) {
    // Parse input format "A->B, C->D"
    const mappings = newMapping.split(',').map(m => m.trim());
    const updatedKey = { ...currentKey };
    
    mappings.forEach(mapping => {
        const [from, to] = mapping.split('->').map(s => s.trim());
        if (from && to) {
            updatedKey[from] = to;
        }
    });
    
    return updatedKey;
}

// Function to create the key adjustment table
function createKeyAdjustmentTable() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const rows = [];
    const itemsPerRow = 7;
    
    for (let i = 0; i < alphabet.length; i += itemsPerRow) {
        const row = alphabet.slice(i, i + itemsPerRow);
        const cells = row.map(letter => `
            <td>
                ${letter} →
                <select class="letter-select" data-letter="${letter}">
                    <option value="_">_</option>
                    ${alphabet.map(l => `
                        <option value="${l}" ${window.currentAnalysis?.key[letter] === l ? 'selected' : ''}>
                            ${l}
                        </option>
                    `).join('')}
                </select>
            </td>
        `).join('');
        rows.push(`<tr>${cells}</tr>`);
    }
    
    return rows.join('');
}

// Event listener for 'Analyze Frequency' button
function validateKeyMapping(newKey) {
    const usedValues = new Set();
    const errors = [];

    for (let [from, to] of Object.entries(newKey)) {
        // Check if letter maps to itself
        if (from === to) {
            errors.push(`Letter ${from} cannot map to itself`);
        }

        // Check if mapping is already used
        if (usedValues.has(to)) {
            errors.push(`Letter ${to} is already mapped to another letter`);
        }
        usedValues.add(to);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // First, ensure decryption output container exists
    const decryptionContainer = document.getElementById('decryptionOutput');
    if (!decryptionContainer) {
        console.error('Decryption output container not found');
        return;
    }

    const style = document.createElement('style');
    style.textContent = `
        .custom-table {
            background-color: #0d1d31;
            color: white !important;
        }
        .custom-table td {
            background-color: #0d1d31;
            color: white !important;
            border-color: #404040;
        }
        .letter-select {
            background-color: #0d1d31;
            color: white;
            border: 1px solid #404040;
        }
        .custom-table select {
            color: white;
        }
        .table-bordered {
            border: 1px solid #404040;
        }
    `;
    document.head.appendChild(style);


    // Add initial HTML structure
    decryptionContainer.innerHTML = `
        <div id="reversedMessage"></div>
        <div class="chart-container"></div>
        <div class="key-adjustment mt-3"></div>
        <div id="currentDecryption"></div>
        <div id="decryptionHistory"></div>
    `;

    // Event listener for analyze frequency
    const analyzeBtn = document.getElementById('analyzeFrequency');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const encryptedInput = document.getElementById('encryptedInput')?.value.toUpperCase();
            if (!encryptedInput) {
                alert('Please enter an encrypted message.');
                return;
            }

            const analysisResult = analyzeEncryptedMessage(encryptedInput);

            // Update all sections individually
            document.getElementById('reversedMessage').innerHTML = `
                <h4>Reversed Encrypted Message:</h4>
                <pre style="color: white;">${analysisResult.reversedMessage}</pre>
            `;

            document.querySelector('.chart-container').innerHTML = `
                <h4>Letter Frequency Analysis</h4>
                <canvas id="decryptionFrequencyChart"></canvas>
            `;

            document.querySelector('.key-adjustment').innerHTML = `
                <h4>Adjust Key:</h4>
                <table class="table table-bordered custom-table">
                    ${createKeyAdjustmentTable()}
                </table>
                <button id="applyKeyChanges" class="btn btn-primary mt-2">Apply Changes</button>
            `;

            // Initialize current state
            window.currentAnalysis = {
                message: analysisResult.reversedMessage,
                key: analysisResult.tentativeKey,
                attempts: []
            };

            // Render histogram
            const maxCount = Math.max(...Object.values(analysisResult.counts)) || 1;
            renderCountsChart(
                'decryptionFrequencyChart',
                analysisResult.counts,
                'Letter Frequency Distribution',
                'rgba(0, 0, 255, 0.7)',
                maxCount
            );

            // Add event listener for key changes
            const applyChangesBtn = document.getElementById('applyKeyChanges');
            if (applyChangesBtn) {
                applyChangesBtn.addEventListener('click', handleKeyChanges);
            }
        });
    }
});


// Separate function to handle key changes
function handleKeyChanges() {
    const currentDecryption = document.getElementById('currentDecryption');
    const decryptionHistory = document.getElementById('decryptionHistory');
    
    if (!currentDecryption || !decryptionHistory || !window.currentAnalysis) return;

    const newKey = {};
    const dropdowns = document.querySelectorAll('.letter-select');
    
    // Clear previous error styling
    dropdowns.forEach(dropdown => {
        dropdown.style.borderColor = '#0d1d31';
    });

    // Collect new mappings
    dropdowns.forEach(dropdown => {
        const from = dropdown.dataset.letter;
        const to = dropdown.value;
        if (to !== '_') {
            newKey[from] = to;
        }
    });

    // Validate new key
    const validation = validateKeyMapping(newKey);
    
    if (!validation.isValid) {
        alert(validation.errors.join('\n'));
        return;
    }

    // Update current key and display
    window.currentAnalysis.key = newKey;
    window.currentAnalysis.attempts.push({
        key: { ...newKey },
        decryption: applyTentativeKey(window.currentAnalysis.message, newKey)
    });

    if (currentDecryption) {
        currentDecryption.innerHTML = `
            <h4>Current Decryption:</h4>
            <pre style="color: white;">${applyTentativeKey(
                window.currentAnalysis.message,
                newKey
            )}</pre>
        `;
    }

    if (decryptionHistory) {
        const historyHTML = window.currentAnalysis.attempts
            .map((attempt, index) => `
                <div class="mt-2">
                    <small>Attempt ${index + 1}:</small>
                    <pre style="color: white;">${attempt.decryption}</pre>
                </div>
            `)
            .join('');
        decryptionHistory.innerHTML = historyHTML;
    }
}

/*N->E, L->T, M->A, H->O, K->I, O->N, R->S, V->H, Y->R, A->D, B->L, C->U*/