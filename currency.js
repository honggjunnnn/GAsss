document.addEventListener('DOMContentLoaded', () => {
    const currencyButtons = document.querySelectorAll('.currency-button');
    currencyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCurrency = button.getAttribute('data-currency');
            convertCurrency(selectedCurrency);
        });
    });

    // Fetch initial exchange rates
    fetchExchangeRates();

    // Convert currency on page load with default SGD
    convertCurrency('SGD');
});

let exchangeRates = {};

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/SGD'); // Replace with your API endpoint
        const data = await response.json();
        exchangeRates = data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

function convertCurrency(selectedCurrency) {
    const transactionsContainer = document.getElementById('transactions-container');
    const transactions = transactionsContainer.querySelectorAll('.transaction-card');

    transactions.forEach(transaction => {
        const amountElement = transaction.querySelector('.transaction-details .amount');
        const originalAmount = parseFloat(amountElement.dataset.originalAmount);
        if (!isNaN(originalAmount)) {
            const convertedAmount = (originalAmount * exchangeRates[selectedCurrency]).toFixed(2);
            amountElement.textContent = `${selectedCurrency} ${convertedAmount}`;
        }
    });
}
