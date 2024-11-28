"use strict";
// Declare variables in a higher scope
let actionButton;
let ctx;
let canvas;
let cipherSelect;
let modularSettings;
let exponentInput;
let modulusInput;
let textTitle;
let textContent;
let originalText = '';
const shift = Math.floor(Math.random() * 25) + 1;

document.addEventListener('DOMContentLoaded', function() {
    cipherSelect = document.getElementById('cipher-select');
    modularSettings = document.getElementById('modular-cipher-settings');
    exponentInput = document.getElementById('exponent');
    modulusInput = document.getElementById('modulus');
    textTitle = document.getElementById('text-title');
    textContent = document.getElementById('text-content');
    actionButton = document.getElementById('action-button');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Fetch the original text once
    fetch('hw8/compiled_text.txt')
        .then(response => response.text())
        .then(data => {
            originalText = data.split(' ').slice(0, 200).join(' ');
            textContent.textContent = originalText; // Display text
            actionButton.disabled = false; // Enable button
            updateCanvas(); // Initial canvas drawing
        })
        .catch(error => console.error('Error fetching the compiled text:', error));

    // Event listener for cipher selection change
    cipherSelect.addEventListener('change', function() {
        if (cipherSelect.value === 'modular') {
            modularSettings.style.display = 'block';
            actionButton.textContent = 'Encrypt'; // Reset button text
        } else {
            modularSettings.style.display = 'none';
            actionButton.textContent = 'Encrypt'; // Reset button text
        }
        updateCanvas(); // Update the canvas when the cipher changes
    });

    // Event listeners for exponent and modulus changes
    exponentInput.addEventListener('input', updateCanvas);
    modulusInput.addEventListener('input', updateCanvas);

    // Action button event listener
    actionButton.addEventListener('click', function() {
        actionButton.disabled = true; // Disable the button during animation

        if (cipherSelect.value === 'caesar') {
            // Caesar Cipher Encryption and Decryption
            if (actionButton.textContent === 'Encrypt') {
                const encryptedText = caesarShift(originalText, shift);
                textTitle.textContent = 'Encrypted Text (Caesar Cipher)';
                typeWriterEffect(textContent, encryptedText, 2, function() {
                    actionButton.disabled = false;
                });
                actionButton.textContent = 'Decrypt';
            } else {
                textTitle.textContent = 'Decrypted Text (Caesar Cipher)';
                typeWriterEffect(textContent, originalText, 2, function() {
                    actionButton.disabled = false;
                });
                actionButton.textContent = 'Encrypt';
            }
        } else if (cipherSelect.value === 'modular') {
            // Modular Exponent Cipher Encryption and Decryption
            const e = parseInt(exponentInput.value);
            const P = parseInt(modulusInput.value);
        
            if (isNaN(e) || isNaN(P) || P <= 1) {
                alert('Please enter valid exponent and modulus values.');
                actionButton.disabled = false;
                return;
            }
        
            if (actionButton.textContent === 'Encrypt') {
                const encryptedText = modularExponentEncrypt(originalText, e, P);
                textTitle.textContent = 'Encrypted Text (Modular Exponent Cipher)';
                typeWriterEffect(textContent, encryptedText, 0.2, function() {
                    actionButton.disabled = false;
                });
                actionButton.textContent = 'Decrypt';
            } else {
                // Modular Exponent Cipher Decryption
                const phiP = P - 1; // Assuming P is prime
                const d = modInverse(e, phiP);
                console.log("D: ", d);
                if (d === null) {
                    alert('Cannot compute modular inverse of e. Decryption is not possible.');
                    actionButton.disabled = false;
                    return;
                }
        
                const decryptedText = modularExponentDecrypt(encryptedText, d, P);
                textTitle.textContent = 'Decrypted Text (Modular Exponent Cipher)';
                typeWriterEffect(textContent, decryptedText, 2, function() {
                    actionButton.disabled = false;
                });
                actionButton.textContent = 'Encrypt';
            }
        } else {
            actionButton.disabled = false;
        }
    });
});

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    if (cipherSelect.value === 'caesar') {
        // Caesar Cipher Visualization
        visualizeCaesarCipher();
    } else if (cipherSelect.value === 'modular') {
        // Modular Exponent Cipher Visualization
        visualizeModularCipher();
    }
}

function visualizeCaesarCipher(){
    const originalFrequencyDistribution = calculateLetterFrequency(originalText);

    // Apply Caesar cipher to the text
    const encryptedText = caesarShift(originalText, shift);
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
    const accuracy = checkDecryptionAccuracy(originalText, decryptedText);
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

}

function visualizeModularCipher() {
    const e = parseInt(exponentInput.value);
    const P = parseInt(modulusInput.value);

    if (isNaN(e) || isNaN(P) || P <= 1) {
        // Do not alert; instead, clear the canvas or display a message
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Optionally display a message on the canvas
        ctx.fillStyle = 'white';
        ctx.font = '20px Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('Enter valid exponent (e) and modulus (P) values to visualize.', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Encrypt the text using Modular Exponent Cipher
    const encryptedText = modularExponentEncrypt(originalText, e, P);

    // Calculate frequency distribution of the encrypted numbers
    const encryptedFrequency = calculateNumberFrequency(encryptedText);

    // Prepare data for visualization
    const labels = Object.keys(encryptedFrequency).map(Number).sort((a, b) => a - b);
    const frequencies = labels.map(num => encryptedFrequency[num]);

    // Draw the frequency distribution on the canvas
    drawNumberFrequencyDistribution(labels, frequencies, 'Encrypted Numerical Values');

    // Display additional information
    ctx.fillStyle = 'white';
    ctx.font = '20px Times New Roman';
    ctx.fillText(`Exponent (e): ${e}`, canvas.width - 120, 30);
    ctx.fillText(`Modulus (P): ${P}`, canvas.width - 120, 60);
}

function modularExponentDecrypt(input, d, P) {
    let result = '';
    const tokens = input.split(' ');

    for (let token of tokens) {
        if (token.match(/^\d+$/)) {
            const C = parseInt(token);
            const L = modPow(C, d, P);
            const ch = String.fromCharCode(L + 'A'.charCodeAt(0));
            result += ch;
        } else {
            result += token;
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

function drawFrequencyDistributions(labels, originalData, encryptedData, originalTitle, encryptedTitle) {
    const chartWidth = canvas.width - 100;
    const chartHeight = (canvas.height - 150) / 2;
    const barWidth = chartWidth / labels.length;

    // Draw Original Text Frequency Distribution
    ctx.fillStyle = 'white';
    ctx.font = '16px Consolas';
    ctx.textAlign = 'center';

    originalData.forEach((value, index) => {
        const barHeight = (value / Math.max(...originalData)) * (chartHeight * 0.8);
        const x = 50 + index * barWidth;
        const y = chartHeight - barHeight + 50;

        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Draw labels
        ctx.fillStyle = 'white';
        ctx.fillText(labels[index], x + barWidth / 2 - 1, chartHeight + 70);
        ctx.fillText(value.toFixed(2) + '%', x + barWidth / 2 - 1, y - 10);
    });

    // Draw Encrypted Text Frequency Distribution
    encryptedData.forEach((value, index) => {
        const barHeight = (value / Math.max(...encryptedData)) * (chartHeight * 0.8);
        const x = 50 + index * barWidth;
        const y = canvas.height - barHeight - 50;

        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Draw labels
        ctx.fillStyle = 'white';
        ctx.fillText(labels[index], x + barWidth / 2 - 1, canvas.height - 30);
        ctx.fillText(value.toFixed(2) + '%', x + barWidth / 2 - 1, y - 10);
    });

    // Draw axes and titles
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, chartHeight + 50);
    ctx.lineTo(canvas.width - 50, chartHeight + 50);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(50, canvas.height / 2 + 50);
    ctx.lineTo(50, canvas.height - 50);
    ctx.lineTo(canvas.width - 50, canvas.height - 50);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Titles
    ctx.fillStyle = 'white';
    ctx.font = '24px Times New Roman';
    ctx.fillText(originalTitle, canvas.width / 2, 40);
    ctx.fillText(encryptedTitle, canvas.width / 2, canvas.height / 2 + 40);
}

function drawNumberFrequencyDistribution(labels, frequencies, title) {
    const chartWidth = canvas.width - 100;
    const chartHeight = canvas.height - 150;
    const barWidth = chartWidth / labels.length;

    ctx.fillStyle = 'white';
    ctx.font = '14px Consolas';
    ctx.textAlign = 'center';

    frequencies.forEach((value, index) => {
        const barHeight = (value / Math.max(...frequencies)) * (chartHeight * 0.8);
        const x = 50 + index * barWidth;
        const y = chartHeight - barHeight + 50;

        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        // Draw labels
        ctx.fillStyle = 'white';
        ctx.fillText(labels[index], x + barWidth / 2 - 1, chartHeight + 70);
        ctx.fillText(value.toFixed(2) + '%', x + barWidth / 2 - 1, y - 10);
    });

    // Draw axes and title
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, chartHeight + 50);
    ctx.lineTo(canvas.width - 50, chartHeight + 50);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Title
    ctx.fillStyle = 'white';
    ctx.font = '24px Times New Roman';
    ctx.fillText(title, canvas.width / 2, 40);
}


function caesarShift(input, shift) {
    let result = '';

    for (let ch of input) {
        if (ch >= 'A' && ch <= 'Z') {
            let offset = 'A'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset + shift) % 26) + offset);
            result += shiftedChar;
        } else if (ch >= 'a' && ch <= 'z') {
            let offset = 'a'.charCodeAt(0);
            let shiftedChar = String.fromCharCode(((ch.charCodeAt(0) - offset + shift) % 26) + offset);
            result += shiftedChar;
        } else {
            result += ch;
        }
    }

    return result;
}

function calculateLetterFrequency(text) {
    const frequency = {};
    const totalLetters = text.replace(/[^a-zA-Z]/g, '').length;

    for (let ch of text.toLowerCase()) {
        if (ch >= 'a' && ch <= 'z') {
            frequency[ch] = (frequency[ch] || 0) + 1;
        }
    }

    for (let ch in frequency) {
        frequency[ch] = (frequency[ch] / totalLetters) * 100;
    }

    return frequency;
}

function decryptCaesarShift(input, shift) {
    return caesarShift(input, 26 - shift);
}

// Modular Exponent Cipher Functions
function modularExponentEncrypt(input, e, P) {
    let result = '';

    for (let ch of input) {
        if (ch.match(/[a-zA-Z]/)) {
            let L = ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
            let E = modPow(L, e, P);
            result += E + ' ';
        } else {
            result += ch + ' ';
        }
    }

    return result.trim();
}

function modularExponentEncrypt(input, e, P) {
    let result = '';

    for (let ch of input) {
        if (ch >= 'A' && ch <= 'Z') {
            let L = ch.charCodeAt(0) - 'A'.charCodeAt(0);
            let E = modPow(L, e, P);
            result += E + ' ';
        } else if (ch >= 'a' && ch <= 'z') {
            let L = ch.charCodeAt(0) - 'a'.charCodeAt(0);
            let E = modPow(L, e, P);
            result += E + ' ';
        } else {
            // Handle spaces or other characters as needed
            result += '';
        }
    }

    return result.trim();
}

function modPow(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1;
        base = (base * base) % modulus;
    }
    return result;
}

function calculateNumberFrequency(text) {
    const frequency = {};
    const numbers = text.split(' ').map(Number);
    const totalNumbers = numbers.length;

    numbers.forEach(num => {
        if (!isNaN(num)) {
            frequency[num] = (frequency[num] || 0) + 1;
        }
    });

    for (let num in frequency) {
        frequency[num] = (frequency[num] / totalNumbers) * 100;
    }

    return frequency;
}

// Function to calculate GCD (Greatest Common Divisor)
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Typewriter Effect Function
function typeWriterEffect(element, text, speed = 2, callback) {
    element.textContent = '';
    let index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;

            // Scroll the text section into view during animation
            const textSection = document.querySelector('.text-section');
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

// Function to calculate Modular Inverse
function modInverse(a, m) {
    const [g, x] = extendedGCD(a, m);
    if (g !== 1) {
        return null; // Modular inverse doesn't exist
    } else {
        return (x % m + m) % m;
    }
}

function extendedGCD(a, b) {
    if (a === 0) {
        return [b, 0, 1];
    } else {
        const [gcd, x1, y1] = extendedGCD(b % a, a);
        const x = y1 - Math.floor(b / a) * x1;
        const y = x1;
        return [gcd, x, y];
    }
}

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