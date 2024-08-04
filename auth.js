document.addEventListener('DOMContentLoaded', () => {
    // Handle Signup Form Submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            // Simple validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Store the new user's data in localStorage for demonstration purposes
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem('email', email);
            localStorage.setItem('phone', phone);

            alert('Sign up successful!');
            window.location.href = 'login.html';
        });
    }

    // Handle Login Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            console.log("Login attempt with username:", username); // Debug log

            const storedUsername = localStorage.getItem('username');
            const storedPassword = localStorage.getItem('password');

            if (username === storedUsername && password === storedPassword) {
                generateAndSend2FACode();
                loginForm.style.display = 'none';
                document.getElementById('2fa-form').style.display = 'block';
            } else {
                alert('Invalid username or password');
            }
        });
    }

    // Handle 2FA Form Submission
    const twoFaForm = document.getElementById('2fa-form');
    if (twoFaForm) {
        twoFaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputCode = document.getElementById('2fa-code').value;
            const storedCode = sessionStorage.getItem('2faCode');

            console.log("2FA code entered:", inputCode); // Debug log

            if (inputCode === storedCode) {
                sessionStorage.setItem('loggedIn', true);
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert('Invalid 2FA code');
            }
        });
    }

    // Check login status
    const protectedPages = ['index.html', 'wallet.html', 'transactions.html', 'paynow.html', 'chart.html', 'anti-fraud.html'];
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.includes(currentPage) && !sessionStorage.getItem('loggedIn')) {
        window.location.href = 'login.html';
    }

    // Card balances stored in the script
    const cardBalances = {
        '6644': 0.00,
        '3201': 0.00
    };

    const updateCardBalanceDisplay = () => {
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(card => {
            const cardNumber = card.getAttribute('data-card-number');
            const balanceElement = card.querySelector('.card-balance');
            if (balanceElement) {
                balanceElement.textContent = `Balance: SGD ${cardBalances[cardNumber].toFixed(2)}`;
            }
        });
    };

    updateCardBalanceDisplay();

    // Setup Add Balance Form
    const addBalanceForm = document.getElementById('add-balance-form');
    if (addBalanceForm) {
        addBalanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const cardNumber = document.getElementById('card-number').value;
            const amount = parseFloat(document.getElementById('amount').value);

            if (cardBalances[cardNumber] !== undefined) {
                cardBalances[cardNumber] += amount;
                alert('Balance updated successfully!');
                updateCardBalanceDisplay();
            } else {
                alert('Card not found!');
            }
        });
    }

    // Setup PayNow Form
    const paynowForm = document.getElementById('paynow-form');
    if (paynowForm) {
        paynowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const card = document.getElementById('card').value;
            const recipient = document.getElementById('recipient').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = new Date().toLocaleDateString();

            if (cardBalances[card] !== undefined) {
                if (cardBalances[card] >= amount) {
                    const transaction = { recipient, amount: amount.toFixed(2), date, card };

                    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
                    transactions.push(transaction);
                    localStorage.setItem('transactions', JSON.stringify(transactions));

                    // Update card balance
                    cardBalances[card] -= amount;
                    alert('Transfer successful!');
                    updateCardBalanceDisplay();

                    // Check for fraudulent transaction
                    if (amount > 1000) {
                        let flaggedTransactions = JSON.parse(localStorage.getItem('flaggedTransactions')) || [];
                        flaggedTransactions.push(transaction);
                        localStorage.setItem('flaggedTransactions', JSON.stringify(flaggedTransactions));
                        alert('Potential fraud transaction detected! Transaction amount exceeds $1000.');
                    }

                    console.log('Transaction added:', transaction); // Debug log
                    window.location.href = 'confirmation.html';
                } else {
                    alert('Insufficient balance!');
                }
            } else {
                alert('Card not found!');
            }
        });
    }

    // Display transactions on page load
    if (currentPage === 'transactions.html') {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        displayTransactions(transactions);
    }

    // Dummy functions for completeness
    function generateAndSend2FACode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        sessionStorage.setItem('2faCode', code);
        alert(`Your 2FA code is: ${code}`); // For testing purposes; replace with email sending logic in production
    }

    function displayTransactions(transactions) {
        const container = document.getElementById('transactions-container');
        if (!container) return; // If container doesn't exist, exit the function
        container.innerHTML = '';
        transactions.forEach((transaction, index) => {
            console.log('Transaction:', transaction); // Log transaction data
            const amount = parseFloat(transaction.amount); // Ensure the amount is parsed as a number
            const transactionElement = document.createElement('div');
            transactionElement.classList.add('transaction-card');
            transactionElement.innerHTML = `
                <div class="card ${transaction.card.includes('6644') ? 'black-card' : 'yellow-card'}">
                    <img src="images/microchip.png" alt="Microchip" class="microchip">
                    <span class="card-type">Mastercard</span>
                    <span class="card-number">${transaction.card}</span>
                    <span class="card-expiry">08/24</span>
                    <img src="images/mastercard.png" alt="Mastercard" class="mastercard-icon">
                    <span class="card-balance">SGD ${amount.toFixed(2)}</span>
                </div>
                <div class="transaction-details">
                    <span class="date">${transaction.date}</span>
                    <span class="name">${transaction.recipient}</span>
                    <span class="amount" data-original-amount="${amount}">SGD ${amount.toFixed(2)}</span>
                    <button class="delete-transaction" data-index="${index}">Delete</button>
                </div>
            `;
            container.appendChild(transactionElement);
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-transaction');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteTransaction(index);
            });
        });

        convertCurrency('SGD'); // Convert currency after displaying transactions
    }

    function deleteTransaction(index) {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        displayTransactions(transactions); // Refresh the transaction list
    }

    // Anti-Fraud Functions
    function checkForFraudulentTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const flaggedTransactions = [];

        transactions.forEach(transaction => {
            // Flag transactions with amount > 1000
            if (parseFloat(transaction.amount) > 1000) {
                flaggedTransactions.push(transaction);
            }
        });

        if (flaggedTransactions.length > 0) {
            console.log('Flagged Transactions:', flaggedTransactions); // Debug log
            localStorage.setItem('flaggedTransactions', JSON.stringify(flaggedTransactions));
        } else {
            localStorage.removeItem('flaggedTransactions');
        }
    }

    function displayFlaggedTransactions() {
        const container = document.getElementById('flagged-transactions-container');
        if (!container) return;

        const flaggedTransactions = JSON.parse(localStorage.getItem('flaggedTransactions')) || [];
        container.innerHTML = '<h2>Flagged Transactions</h2>';
        flaggedTransactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.classList.add('transaction-card');
            transactionElement.innerHTML = `
                <div class="card ${transaction.card.includes('6644') ? 'black-card' : 'yellow-card'}">
                    <img src="images/microchip.png" alt="Microchip" class="microchip">
                    <span class="card-type">Mastercard</span>
                    <span class="card-number">${transaction.card}</span>
                    <span class="card-expiry">08/24</span>
                    <img src="images/mastercard.png" alt="Mastercard" class="mastercard-icon">
                    <span class="card-balance">SGD ${parseFloat(transaction.amount).toFixed(2)}</span>
                </div>
                <div class="transaction-details">
                    <span class="date">${transaction.date}</span>
                    <span class="name">${transaction.recipient}</span>
                    <span class="amount" data-original-amount="${parseFloat(transaction.amount)}">SGD ${parseFloat(transaction.amount).toFixed(2)}</span>
                    <button class="delete-transaction" data-index="${index}" data-flagged="true">Delete</button>
                </div>
            `;
            container.appendChild(transactionElement);
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-transaction');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const flagged = this.getAttribute('data-flagged');
                deleteTransaction(index, flagged);
            });
        });
    }

    function deleteTransaction(index, flagged = false) {
        let transactions = JSON.parse(localStorage.getItem(flagged ? 'flaggedTransactions' : 'transactions')) || [];
        transactions.splice(index, 1);
        localStorage.setItem(flagged ? 'flaggedTransactions' : 'transactions', JSON.stringify(transactions));
        if (flagged) {
            displayFlaggedTransactions(); // Refresh the flagged transaction list
        } else {
            displayTransactions(transactions); // Refresh the transaction list
        }
    }

    function convertCurrency(baseCurrency) {
        // Implementation for currency conversion
    }

    // Initialize forms
    setupAddBalanceForm();
    setupPayNowForm();
});
