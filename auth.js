document.addEventListener('DOMContentLoaded', () => {
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

    const paynowForm = document.getElementById('paynow-form');
    if (paynowForm) {
        paynowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const card = document.getElementById('card').value;
            const recipient = document.getElementById('recipient').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = new Date().toLocaleDateString();

            if (cardBalances[card] !== undefined) {
                cardBalances[card] -= amount;
                const transaction = { recipient, amount: amount.toFixed(2), date, card };
                alert('Transfer successful!');
                updateCardBalanceDisplay();
                console.log('Transaction added:', transaction); // Debug log
            } else {
                alert('Card not found!');
            }
        });
    }

    // Dummy functions for transactions and 2FA for completeness
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

    function setupAddBalanceForm() {
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
    }

    function setupPayNowForm() {
        const paynowForm = document.getElementById('paynow-form');
        if (paynowForm) {
            paynowForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const card = document.getElementById('card').value;
                const recipient = document.getElementById('recipient').value;
                const amount = parseFloat(document.getElementById('amount').value);
                const date = new Date().toLocaleDateString();

                if (cardBalances[card] !== undefined) {
                    cardBalances[card] -= amount;
                    const transaction = { recipient, amount: amount.toFixed(2), date, card };
                    alert('Transfer successful!');
                    updateCardBalanceDisplay();
                    console.log('Transaction added:', transaction); // Debug log
                } else {
                    alert('Card not found!');
                }
            });
        }
    }

    // Initialize forms
    setupAddBalanceForm();
    setupPayNowForm();
});
