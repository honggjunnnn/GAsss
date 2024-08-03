document.addEventListener('DOMContentLoaded', () => {
    checkForFraudulentTransactions();
});

function checkForFraudulentTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const flaggedTransactions = [];

    transactions.forEach(transaction => {
        // Example criteria for flagging a transaction as fraudulent
        if (isFraudulent(transaction)) {
            flaggedTransactions.push(transaction);
        }
    });

    if (flaggedTransactions.length > 0) {
        alert('Potential fraudulent transactions detected!');
        console.table(flaggedTransactions); // For debugging, you can remove this in production
        displayFlaggedTransactions(flaggedTransactions);
    }
}

function isFraudulent(transaction) {
    // Example fraud detection criteria:
    const largeAmountThreshold = 1000; // Example threshold
    const frequentTransactionThreshold = 5; // Example threshold

    // Criteria 1: Large transaction amount
    if (parseFloat(transaction.amount) > largeAmountThreshold) {
        return true;
    }

    // Criteria 2: Frequent transactions to the same recipient
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const similarTransactions = transactions.filter(t => t.recipient === transaction.recipient);
    if (similarTransactions.length > frequentTransactionThreshold) {
        return true;
    }

    // Add more criteria as needed

    return false;
}

function displayFlaggedTransactions(flaggedTransactions) {
    const container = document.getElementById('flagged-transactions-container');
    if (!container) return;

    container.innerHTML = '<h2>Flagged Transactions</h2>';
    flaggedTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.classList.add('transaction');
        transactionElement.innerHTML = `
            <span class="date">${transaction.date}</span>
            <span class="name">${transaction.recipient}</span>
            <span class="amount">SGD ${parseFloat(transaction.amount).toFixed(2)}</span>
            <span class="card">Card: ${transaction.card}</span>
        `;
        container.appendChild(transactionElement);
    });
}
