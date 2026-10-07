// scripts/discovery.mjs

// Relative path fix (assuming locations.mjs is inside scripts/data/)
import { locations } from '../data/locations.mjs';

const container = document.querySelector('#locations-container');

if (container) {
    locations.forEach(place => {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `
            <img src="${place.image}" alt="${place.name}" loading="lazy" width="300" height="200">
            <h2>${place.name}</h2>
            <p><strong>Address:</strong> ${place.address}</p>
            <p>${place.description}</p>
        `;
        container.appendChild(card);
    });
}
// Function to display visitor message based on localStorage
function displayVisitorMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'visit-message';
    
    // Add close button functionality
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-message-btn';
    closeBtn.textContent = '❌';
    closeBtn.setAttribute('aria-label', 'Close message');
    closeBtn.addEventListener('click', () => {
        messageContainer.remove();
    });

    const messageText = document.createElement('p');

    // Get current time in milliseconds
    const currentVisit = Date.now();
    const lastVisit = localStorage.getItem('lastVisitDate');

    if (!lastVisit) {
        // First visit
        messageText.textContent = "Welcome! Let us know if you have any questions.";
    } else {
        // Calculate difference in days (1 day = 86,400,000 milliseconds)
        const msInDay = 86400000;
        const timeDifference = currentVisit - Number(lastVisit);
        const daysDifference = Math.floor(timeDifference / msInDay);

        if (timeDifference < msInDay) {
            // Visited less than 24 hours ago
            messageText.textContent = "Back so soon! Awesome!";
        } else if (daysDifference === 1) {
            // Visited exactly 1 day ago
            messageText.textContent = "You last visited 1 day ago.";
        } else {
            // Visited multiple days ago
            messageText.textContent = `You last visited ${daysDifference} days ago.`;
        }
    }

    // Save current visit timestamp to localStorage
    localStorage.setItem('lastVisitDate', currentVisit);

    // Assemble banner and insert at top of main
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(closeBtn);
    
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.insertBefore(messageContainer, mainElement.firstChild);
    }
}

// Run visit message display on page load
displayVisitorMessage();