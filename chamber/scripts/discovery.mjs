// scripts/discovery.mjs

// Relative path fix (assuming locations.mjs is inside scripts/data/)
import { locations } from './locations.mjs';

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