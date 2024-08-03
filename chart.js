document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('transactionChart').getContext('2d');

    // Fetch transaction data from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Process transaction data for the chart
    const dates = transactions.map(transaction => transaction.date);
    const amounts = transactions.map(transaction => parseFloat(transaction.amount));

    // Create the line chart
    const transactionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Transaction Amounts',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Date',
                        color: 'rgba(0, 0, 0, 0.8)', // Set x-axis title color
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.8)' // Set x-axis labels color
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (SGD)',
                        color: 'rgba(0, 0, 0, 0.8)', // Set y-axis title color
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.8)' // Set y-axis labels color
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(0, 0, 0, 0.8)' // Set legend labels color
                    }
                },
                title: {
                    display: true,
                    text: 'Transaction Analysis',
                    color: 'rgba(0, 0, 0, 0.8)' // Set chart title color
                }
            }
        }
    });
});
