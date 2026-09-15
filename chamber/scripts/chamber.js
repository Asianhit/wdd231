// Dynamic dates for footer
document.addEventListener('DOMContentLoaded', () => {
    const currentYearEl = document.getElementById('currentYear');
    const lastModifiedEl = document.getElementById('lastModified');
    
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
    if (lastModifiedEl) lastModifiedEl.textContent = document.lastModified;
});

// Hamburger Navigation Toggle
const hamBtn = document.querySelector('#ham-btn');
const navBar = document.querySelector('#nav-bar');

if (hamBtn && navBar) {
    hamBtn.addEventListener('click', () => {
        navBar.classList.toggle('show');
        hamBtn.classList.toggle('show');
    });
}

// Data Source URL
const membersUrl = 'data/member.json';
const container = document.querySelector('#directory-container');

// Map Membership Levels (1=Member, 2=Silver, 3=Gold)
function getMembershipText(level) {
    switch (level) {
        case 3:
            return 'Gold Member';
        case 2:
            return 'Silver Member';
        case 1:
        default:
            return 'Member';
    }
}

// Fetch JSON data asynchronously
async function getMembersData() {
    try {
        const response = await fetch(membersUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const members = await response.json();
        displayMembers(members);
    } catch (error) {
        console.error('Error fetching member data:', error);
        if (container) {
            container.innerHTML = '<p class="error-msg">Failed to load member directory data.</p>';
        }
    }
}

// Render dynamic elements to the HTML container
function displayMembers(members) {
    if (!container) return;
    container.innerHTML = ''; // Clear existing contents

    members.forEach((member) => {
        // Create article card block
        const card = document.createElement('article');
        card.className = 'business-card';

        const membershipText = getMembershipText(member.membershipLevel);

        card.innerHTML = `
            <header class="card-header">
                <h2>${member.name}</h2>
                <p class="tagline">${member.description}</p>
                <span class="badge badge-level-${member.membershipLevel}">${membershipText}</span>
            </header>
            <div class="card-body">
                <div class="img-container">
                    <img src="${member.image}" alt="${member.name} Logo" loading="lazy" width="90" height="90">
                </div>
                <div class="card-details">
                    <p><strong>ADDRESS:</strong> ${member.address}</p>
                    <p><strong>PHONE:</strong> ${member.phone}</p>
                    <p><strong>URL:</strong> <a href="${member.website}" target="_blank" rel="noopener">${member.website.replace('https://', '')}</a></p>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Grid vs List View Switching
const gridBtn = document.querySelector('#grid-btn');
const listBtn = document.querySelector('#list-btn');

if (gridBtn && listBtn && container) {
    gridBtn.addEventListener('click', () => {
        container.classList.add('cards-grid-view');
        container.classList.remove('cards-list-view');
        gridBtn.classList.add('active-view');
        listBtn.classList.remove('active-view');
    });

    listBtn.addEventListener('click', () => {
        container.classList.add('cards-list-view');
        container.classList.remove('cards-grid-view');
        listBtn.classList.add('active-view');
        gridBtn.classList.remove('active-view');
    });
}

// Initialize directory fetch
getMembersData();