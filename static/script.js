// Written by ChatGPT with adjustments made by me

document.addEventListener('DOMContentLoaded', () => {
    // Set default ticker to AAPL and load data
    document.getElementById('ticker').value = 'AAPL';
    search();
});

document.getElementById('ticker').addEventListener('input', function() {
    const input = this.value.trim();
    if (input.length >= 2) {
        fetch(`/search_ticker?query=${input}`)
            .then(response => response.json())
            .then(data => {
                const dropdown = document.getElementById('ticker-dropdown');
                dropdown.innerHTML = '';
                data.forEach(symbol => {
                    const option = document.createElement('div');
                    option.textContent = symbol;
                    option.addEventListener('click', () => {
                        document.getElementById('ticker').value = symbol;
                        dropdown.innerHTML = '';
                        search();
                    });
                    dropdown.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }
});

// Color bank for each data type
const colorBank = {
    Blue: 'rgba(54, 162, 235, 0.2)',
    Red: 'rgba(255, 99, 132, 0.2)',
    Green: 'rgba(75, 192, 192, 0.2)',
    Yellow: 'rgba(255, 206, 86, 0.2)',
    Purple: 'rgba(153, 102, 255, 0.2)',
    Orange: 'rgba(255, 159, 64, 0.2)',
    DarkBlue: 'rgba(54, 162, 235, 0.2)',
    DarkGreen: 'rgba(75, 192, 192, 0.2)'
};

function search() {
    const ticker = document.getElementById('ticker').value;

    fetch(`/get_data?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            console.log('Cash Flow Data:', data.cash_flow);
            console.log('Earnings Data:', data.earnings);
            console.log('Dividends Data:', data.dividends);

            displayCashFlow(data.cash_flow);
            displayEarnings(data.earnings);
            displayDividends(data.dividends);
        })
        .catch(error => console.error('Error:', error));
}

function displayCashFlow(cashFlow) {
    const cashFlowData = document.getElementById('cash-flow-data');
    cashFlowData.innerHTML = "<h3>Cash Flow Statement</h3>";
    const originalCanvas = document.createElement('canvas');
    originalCanvas.id = 'cash-flow-chart';
    cashFlowData.appendChild(originalCanvas);

    originalCanvas.addEventListener('click', () => {
        displayModal(cashFlow, 'Free Cash Flow', colorBank.Blue, 'Year', true);
    });

    displayChart(originalCanvas, cashFlow, 'Free Cash Flow', colorBank.Blue, 'Year');
}

function displayEarnings(earnings) {
    const earningsData = document.getElementById('earnings-data');
    earningsData.innerHTML = "<h3>Earnings</h3>";
    const originalCanvas = document.createElement('canvas');
    originalCanvas.id = 'earnings-chart';
    earningsData.appendChild(originalCanvas);

    originalCanvas.addEventListener('click', () => {
        displayModal(earnings, 'Earnings', colorBank.Red, 'Year', true);
    });

    displayChart(originalCanvas, earnings, 'Revenue', colorBank.Red, 'Year');
}

function displayDividends(dividends) {
    const dividendsData = document.getElementById('dividends-data');
    dividendsData.innerHTML = "<h3>Dividends</h3>";
    const originalCanvas = document.createElement('canvas');
    originalCanvas.id = 'dividends-chart';
    dividendsData.appendChild(originalCanvas);

    originalCanvas.addEventListener('click', () => {
        displayModal(dividends, 'Dividends', colorBank.Green, 'Date');
    });

    displayChart(originalCanvas, dividends, 'Dividends', colorBank.Green, 'Date');
}

function displayModal(data, label, color, xAxisLabel, displayReturns = false) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    // Add event listener to close modal when overlay is clicked
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Create modal title and subtitle
    const title = document.createElement('h2');
    title.textContent = label;
    modalContent.appendChild(title);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'X';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        modalOverlay.remove(); // Remove modal overlay when close button is clicked
    });
    modalContent.appendChild(closeButton);

    // Create canvas for modal
    const modalCanvas = document.createElement('canvas');
    modalContent.appendChild(modalCanvas);

    // Append modal content to overlay
    modalOverlay.appendChild(modalContent);

    // Append overlay to body
    document.body.appendChild(modalOverlay);

    // Display chart on modal canvas
    displayChart(modalCanvas, data, label, color, xAxisLabel);

    // Display annualized returns if specified
    if (displayReturns) {
        displayAnnualizedReturns(data, modalContent);
    }
}

function displayChart(canvas, data, label, color, xAxisLabel) {
    const ctx = canvas.getContext('2d');
    const years = Object.keys(data);
    let values = Object.values(data);

    let maxDataValue = Math.max(...values);
    let yAxisLabel = 'Dollars';
    if (maxDataValue >= 1e6) {
        values = values.map(value => value / 1e6);
        yAxisLabel = 'Dollars (in millions)';
    }

    // Set canvas height to be 80% of the container height
    const containerHeight = canvas.parentElement.clientHeight;
    canvas.height = containerHeight * 0.8;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: label, // Use specified label
                data: values,
                backgroundColor: color, // Use specified color
                borderColor: color.replace('0.2', '1'), // Use a darker version of the color for the border
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxisLabel // Use specified x-axis label
                    }
                }
            }
        }
    });
}

function displayAnnualizedReturns(data, container) {
    const returnsContainer = document.createElement('div');
    returnsContainer.classList.add('annualized-returns');

    const periods = [1, 3, 5, 10]; // Define periods for annualized returns calculation

    periods.forEach(period => {
        const annualizedReturn = calculateAnnualizedReturn(data, period);
        const returnElement = document.createElement('span');
        returnElement.textContent = `${period} yr: ${annualizedReturn.toFixed(2)}%`;

        if (annualizedReturn >= 0) {
            returnElement.classList.add('positive-return');
        } else {
            returnElement.classList.add('negative-return');
        }

        returnsContainer.appendChild(returnElement);
    });

    // Append returns container to the modal content
    container.appendChild(returnsContainer);
}


function calculateAnnualizedReturn(data, years) {
    const lastYear = parseInt(Object.keys(data)[Object.keys(data).length - 1]);
    const initialValue = data[lastYear - years] || data[lastYear]; // Use the value from `years` ago, or the last available value
    const finalValue = data[lastYear];
    const totalYears = years;

    const annualizedReturn = (finalValue / initialValue) ** (1 / totalYears) - 1;
    return annualizedReturn * 100; // Convert to percentage
}
