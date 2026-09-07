const navButton = document.querySelector('#ham-btn');
const navMenu = document.querySelector('#nav-bar');

navButton.addEventListener('click', () => {
    navButton.classList.toggle('show');
    navMenu.classList.toggle('show');
});