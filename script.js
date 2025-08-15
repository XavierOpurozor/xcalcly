// This script provides the core functionality for the Xcalcly calculator,
// handling all button clicks, expression evaluation, and display updates.

// ==== DOM ELEMENTS ====
// Get the calculator's display input fields.
const expressionDisplay = document.getElementById('expression-display');
const resultDisplay = document.getElementById('result-display');

// Get all buttons using a class selector.
const buttons = document.querySelectorAll('.buttons button');

// Get the AI modal and its close button, as per user's request to keep them.
const aiModal = document.getElementById('ai-modal');
const aiModalCloseBtn = document.getElementById('ai-modal-close-btn');

// ==== STATE VARIABLES ====
// A string to hold the current mathematical expression.
let currentExpression = '';
// A boolean to toggle between degree and radian mode.
let isDegreeMode = true;
// A variable to store a value in memory.
let memory = 0;
// A variable to store the result of the last calculation.
let lastAnswer = 0;
// A flag to check if the last operation was a calculation.
let isCalculationFinished = false;

// ==== HELPER FUNCTIONS ====

/**
 * Converts degrees to radians.
 * @param {number} degrees The value in degrees.
 * @returns {number} The value in radians.
 */
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param {number} radians The value in radians.
 * @returns {number} The value in degrees.
 */
function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Calculates the factorial of a number.
 * @param {number} n The number to calculate the factorial of.
 * @returns {number} The factorial of n.
 */
function factorial(n) {
    if (n < 0) {
        return NaN;
    }
    if (n === 0) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}


/**
 * Appends a value to the current expression and updates the display.
 * It also handles special cases for operators and decimal points.
 * @param {string} value The value of the button that was clicked.
 */
function appendToDisplay(value) {
    // If the previous calculation is finished and the new input is a number or parenthesis, clear the display.
    if (isCalculationFinished && (/\d/.test(value) || value === '(')) {
        currentExpression = '';
        isCalculationFinished = false;
        expressionDisplay.value = '';
        resultDisplay.value = '';
    }
    currentExpression += value;
    expressionDisplay.value = currentExpression;
}

/**
 * Deletes the last character from the current expression.
 */
function deleteLastChar() {
    currentExpression = currentExpression.slice(0, -1);
    expressionDisplay.value = currentExpression;
}

/**
 * Clears the display and resets the current expression.
 */
function clearAll() {
    currentExpression = '';
    expressionDisplay.value = '';
    resultDisplay.value = '';
    isCalculationFinished = false;
}

/**
 * Calculates the result of the current expression.
 * It uses a try-catch block to handle potential errors in the expression.
 */
function calculate() {
    try {
        // Check for division by zero before evaluating
        if (currentExpression.includes('/0')) {
            throw new Error('Division by zero is not allowed.');
        }

        // Replace special characters with their JavaScript equivalents
        let expressionToEvaluate = currentExpression
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/ans/g, `(${lastAnswer})`) // Use the last answer
            .replace(/\^/g, '**');

        // Handle trigonometric and inverse functions based on the current mode
        if (isDegreeMode) {
            expressionToEvaluate = expressionToEvaluate
                .replace(/sin\(/g, `Math.sin(degToRad(`)
                .replace(/cos\(/g, `Math.cos(degToRad(`)
                .replace(/tan\(/g, `Math.tan(degToRad(`)
                .replace(/arcsin\(/g, `radToDeg(Math.asin(`)
                .replace(/arccos\(/g, `radToDeg(Math.acos(`)
                .replace(/arctan\(/g, `radToDeg(Math.atan(`);
        } else {
            expressionToEvaluate = expressionToEvaluate
                .replace(/sin\(/g, `Math.sin(`)
                .replace(/cos\(/g, `Math.cos(`)
                .replace(/tan\(/g, `Math.tan(`)
                .replace(/arcsin\(/g, `Math.asin(`)
                .replace(/arccos\(/g, `Math.acos(`)
                .replace(/arctan\(/g, `Math.atan(`);
        }

        // Add a case for natural log and base 10 log
        expressionToEvaluate = expressionToEvaluate
            .replace(/ln\(/g, 'Math.log(')
            .replace(/log\(/g, 'Math.log10(');

        // Handle powers of 10 and e
        expressionToEvaluate = expressionToEvaluate
            .replace(/pow10\(/g, 'Math.pow(10,')
            .replace(/powE\(/g, 'Math.pow(Math.E,');
            
        // Use eval() to compute the result.
        const result = eval(expressionToEvaluate);

        // Update the display with the result, save the answer, and reset the expression.
        resultDisplay.value = result;
        currentExpression = String(result);
        lastAnswer = result;
        isCalculationFinished = true; // Set the flag to true after a successful calculation.

    } catch (error) {
        // Provide more specific error messages for different types of errors
        if (error instanceof SyntaxError) {
            resultDisplay.value = 'Syntax Error';
        } else if (error instanceof TypeError) {
            resultDisplay.value = 'Invalid input';
        } else if (error instanceof ReferenceError) {
            resultDisplay.value = 'Invalid expression';
        } else {
            // For other errors, display the specific error message
            resultDisplay.value = error.message;
        }
        currentExpression = ''; // Reset the expression on error.
    }
}

// ==== EVENT LISTENERS ====

// Show the AI guidance modal on page load, as per user's request.
window.onload = () => {
    aiModal.style.display = 'flex';
};

// Close the AI guidance modal, as per user's request.
aiModalCloseBtn.addEventListener('click', () => {
    aiModal.style.display = 'none';
});

// Loop through all buttons and add a click event listener to each one.
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the value from the 'data-value' attribute.
        const value = button.getAttribute('data-value');
        const buttonText = button.textContent;

        // Handle different button values.
        switch (value) {
            case 'AC':
                clearAll();
                break;
            case 'del':
                deleteLastChar();
                break;
            case '=':
                calculate();
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'arcsin':
            case 'arccos':
            case 'arctan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'pow10':
            case 'powE':
                // For scientific functions, append the function call with an opening parenthesis.
                appendToDisplay(`${value}(`);
                break;
            case 'factorial':
                // Calculate factorial of the current number on the display
                try {
                    const number = parseFloat(expressionDisplay.value);
                    if (!isNaN(number)) {
                        const result = factorial(number);
                        resultDisplay.value = result;
                        currentExpression = String(result);
                        lastAnswer = result;
                        isCalculationFinished = true;
                    }
                } catch (e) {
                    resultDisplay.value = 'Error';
                    currentExpression = '';
                }
                break;
            case 'mode':
                // Toggle between degree and radian mode.
                isDegreeMode = !isDegreeMode;
                button.textContent = isDegreeMode ? 'DEG' : 'RAD';
                break;
            case 'M+':
                // Add the current number on the display to memory
                try {
                    const num = eval(currentExpression);
                    if (!isNaN(num)) {
                        memory += num;
                        resultDisplay.value = memory;
                    }
                } catch (e) {
                    resultDisplay.value = 'Error';
                }
                currentExpression = '';
                isCalculationFinished = true;
                break;
            case 'MC':
                // Clear the memory
                memory = 0;
                resultDisplay.value = 0;
                currentExpression = '';
                isCalculationFinished = true;
                break;
            case 'MR':
                // Recall the value from memory
                appendToDisplay(memory);
                break;
            case 'ans':
                // Use the last answer in the current expression
                appendToDisplay('ans');
                break;
            default:
                // For all other buttons (numbers, operators, decimals, etc.),
                // append the value to the expression.
                appendToDisplay(buttonText);
                break;
        }
    });
});

// Add keyboard support
document.addEventListener('keydown', event => {
    const key = event.key;
    const validKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '-', '*', '/', '.', '(', ')', '%', 'Enter', 'Escape', 'Backspace'
    ];

    if (validKeys.includes(key)) {
        event.preventDefault(); // Prevent default browser behavior
        if (key === 'Enter') {
            calculate();
        } else if (key === 'Escape') {
            clearAll();
        } else if (key === 'Backspace') {
            deleteLastChar();
        } else {
            appendToDisplay(key);
        }
    }
});
