"use strict";

const shift = Math.floor(Math.random() * 25) + 1;

function calculateLetterFrequency(text) {
    const frequency = {};
    let totalLetters = 0;

    for (let ch of text) {
        if (ch.match(/[a-zA-Z]/)) {
            ch = ch.toLowerCase();
            if (frequency[ch]) {
                frequency[ch]++;
            } else {
                frequency[ch] = 1;
            }
            totalLetters++;
        }
    }

    // Convert counts to percentages
    let totalPercentage = 0;
    for (let letter in frequency) {
        frequency[letter] = (frequency[letter] / totalLetters) * 100;
        totalPercentage += frequency[letter];
    }

    // Normalize to ensure the total is 100%
    const normalizationFactor = 100 / totalPercentage;
    for (let letter in frequency) {
        frequency[letter] *= normalizationFactor;
    }

    return frequency;
}

function caesarShift(input, shift) {
    let result = '';

    for (let ch of input) {
        if (ch >= 'A' && ch <= 'Z') {
            let offset = 'A'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset + shift) % 26 + offset));
            result += shiftedChar;
        } else if (ch >= 'a' && ch <= 'z') {
            let offset = 'a'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset + shift) % 26 + offset));
            result += shiftedChar;
        } else if (ch >= '0' && ch <= '9') {
            let offset = '0'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset + shift) % 10 + offset));
            result += shiftedChar;
        } else {
            result += ch;
        }
    }

    return result;
}

function findShift(encryptedFrequency, englishFrequency) {
    // Find the most frequent letter in the encrypted text
    let maxEncryptedLetter = '';
    let maxEncryptedFrequency = 0;
    for (let letter in encryptedFrequency) {
        if (encryptedFrequency[letter] > maxEncryptedFrequency) {
            maxEncryptedFrequency = encryptedFrequency[letter];
            maxEncryptedLetter = letter;
        }
    }

    // Find the most frequent letter in the English frequency distribution
    let maxEnglishLetter = '';
    let maxEnglishFrequency = 0;
    for (let letter in englishFrequency) {
        if (englishFrequency[letter] > maxEnglishFrequency) {
            maxEnglishFrequency = englishFrequency[letter];
            maxEnglishLetter = letter;
        }
    }

    // Calculate the shift
    const shift = (maxEncryptedLetter.charCodeAt(0) - maxEnglishLetter.charCodeAt(0) + 26) % 26;
    return shift;
}

function decryptCaesarShift(input, shift) {
    let result = '';

    for (let ch of input) {
        if (ch >= 'A' && ch <= 'Z') {
            let offset = 'A'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset - shift + 26) % 26 + offset));
            result += shiftedChar;
        } else if (ch >= 'a' && ch <= 'z') {
            let offset = 'a'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset - shift + 26) % 26 + offset));
            result += shiftedChar;
        } else {
            result += ch;
        }
    }
    return result;
}

function checkDecryptionAccuracy(originalText, decryptedText) {
    let correctCount = 0;
    const totalCount = originalText.length;

    for (let i = 0; i < totalCount; i++) {
        if (originalText[i] === decryptedText[i]) {
            correctCount++;
        }
    }

    const accuracy = (correctCount / totalCount) * 100;
    return accuracy;
}



document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    fetch('hw8/compiled_text.txt')
        .then(response => response.text())
        .then(data => {
            const text = data;
            

            // Calculate frequency distribution of the original text
            const originalFrequencyDistribution = calculateLetterFrequency(text);

            // Apply Caesar cipher to the text
            const encryptedText = caesarShift(text, shift);
            console.log("Output: ", encryptedText);

            // Calculate frequency distribution of the encrypted text
            const encryptedFrequencyDistribution = calculateLetterFrequency(encryptedText);
            console.table(originalFrequencyDistribution);

            const detectedShift = findShift(encryptedFrequencyDistribution, englishLetterFrequency);
            console.log("Detected Shift: ", detectedShift);

            // Decrypt the text using the detected shift
            const decryptedText = decryptCaesarShift(encryptedText, detectedShift);
            console.log("Decrypted Text: ", decryptedText);

            // Check the accuracy of the decryption
            const accuracy = checkDecryptionAccuracy(text, decryptedText);
            console.log("Decryption Accuracy: ", accuracy.toFixed(2) + "%");

            // Prepare data for visualization
            const labels = 'abcdefghijklmnopqrstuvwxyz'.split('');
            const originalData = labels.map(letter => originalFrequencyDistribution[letter] || 0);
            const encryptedData = labels.map(letter => encryptedFrequencyDistribution[letter] || 0);


            // Chart dimensions
            const chartWidth = canvas.width - 100;
            const chartHeight = (canvas.height - 150) / 2; // Increased space between charts
            const barWidth = chartWidth / labels.length;

            // Draw the original frequency distribution
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '16px Consolas';
            ctx.textAlign = 'center';

            originalData.forEach((value, index) => {
                const barHeight = (value / Math.max(...originalData)) * (chartHeight * 0.8); // Reduce bar height
                const x = 50 + index * barWidth;
                const y = chartHeight - barHeight + 50;

                ctx.fillStyle = 'blue';
                ctx.fillRect(x, y, barWidth - 10, barHeight);

                // Draw labels
                ctx.fillStyle = 'white';
                ctx.fillText(labels[index], x + barWidth / 2 - 5, chartHeight + 70);
                ctx.fillText(Math.round(value) + '%', x + barWidth / 2 - 5, y - 10);
            });

            // Draw axes for the original distribution
            ctx.beginPath();
            ctx.moveTo(50, 50);
            ctx.lineTo(50, chartHeight + 50);
            ctx.lineTo(canvas.width - 50, chartHeight + 50);
            ctx.stroke();

            // Draw the encrypted frequency distribution
            encryptedData.forEach((value, index) => {
                const barHeight = (value / Math.max(...encryptedData)) * (chartHeight * 0.8); // Reduce bar height
                const x = 50 + index * barWidth;
                const y = canvas.height - barHeight - 50; // Increased space between charts

                ctx.fillStyle = 'red';
                ctx.fillRect(x, y, barWidth - 10, barHeight);

                // Draw labels
                ctx.fillStyle = 'white';
                ctx.fillText(labels[index], x + barWidth / 2 - 5, canvas.height - 30);
                ctx.fillText(Math.round(value) + '%', x + barWidth / 2 - 5, y - 10);
            });

            // Draw axes for the encrypted distribution
            ctx.beginPath();
            ctx.moveTo(50, canvas.height / 2 + 100);
            ctx.lineTo(50, canvas.height - 50);
            ctx.lineTo(canvas.width - 50, canvas.height - 50);
            ctx.stroke();

            // Display the shift amount on the top right
            ctx.fillStyle = 'white';
            ctx.font = '20px Times New Roman';
            ctx.fillText(`Shift: ${shift}`, canvas.width - 70, 30);

            // Display the accuracy on the canvas
            ctx.fillStyle = 'white';
            ctx.font = '20px Times New Roman';
            ctx.textAlign = 'center';
            ctx.fillText("Decryption Accuracy: " + accuracy.toFixed(2) + "%", canvas.width - 150, 60);

        })
        .catch(error => console.error('Error fetching the compiled text:', error));
});

function typeWriterEffect(element, text, speed = 2, callback) {
    element.textContent = '';
    let index = 0;

    // Get the text section element
    const textSection = document.querySelector('.text-section');

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;

            // Scroll the text section into view
            textSection.scrollIntoView({ behavior: 'smooth', block: 'end' });

            setTimeout(type, speed);
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    }

    type();
}

document.addEventListener('DOMContentLoaded', function() {
    const textTitle = document.getElementById('text-title');
    const textContent = document.getElementById('text-content');
    const actionButton = document.getElementById('action-button');

    let originalText = '';
    let encryptedText = '';
    let decryptedText = '';
    const shift = Math.floor(Math.random() * 25) + 1; // Random shift between 1 and 25

    // Disable the button until the text is loaded
    actionButton.disabled = true;

    fetch('hw8/compiled_text.txt')
        .then(response => response.text())
        .then(data => {
            originalText = data.split(' ').slice(0, 200).join(' ');
            textContent.textContent = originalText; // Display text without animation
            actionButton.disabled = false; // Re-enable the button
        })
        .catch(error => console.error('Error fetching the compiled text:', error));

    actionButton.addEventListener('click', function() {
        actionButton.disabled = true; // Disable the button during animation

        if (actionButton.textContent === 'Encrypt') {
            encryptedText = caesarShift(originalText, shift);
            textTitle.textContent = 'Encrypted Text';
            typeWriterEffect(textContent, encryptedText, 2, function() {
                actionButton.disabled = false; // Re-enable after animation
            });
            actionButton.textContent = 'Decrypt';
        } else if (actionButton.textContent === 'Decrypt') {
            decryptedText = decryptCaesarShift(encryptedText, shift);
            textTitle.textContent = 'Decrypted Text';
            typeWriterEffect(textContent, decryptedText, 2, function() {
                actionButton.disabled = false; // Re-enable after animation
            });
            actionButton.textContent = 'Encrypt';
        }
    });
});

// English (EN) Letter Frequency Distribution
const englishLetterFrequency = {
    'a': 8.17,
    'b': 1.49,
    'c': 2.78,
    'd': 4.25,
    'e': 12.70,
    'f': 2.23,
    'g': 2.02,
    'h': 6.09,
    'i': 7.00,
    'j': 0.15,
    'k': 0.77,
    'l': 4.03,
    'm': 2.41,
    'n': 6.75,
    'o': 7.51,
    'p': 1.93,
    'q': 0.10,
    'r': 5.99,
    's': 6.33,
    't': 9.06,
    'u': 2.76,
    'v': 0.98,
    'w': 2.36,
    'x': 0.15,
    'y': 1.97,
    'z': 0.07
};
