document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Hidden Form Timestamp
    const timestampInput = document.getElementById('timestamp');
    if (timestampInput) {
        timestampInput.value = new Date().toISOString();
    }

    // 2. Open Modal Dialogs based on data-modal attribute
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.showModal();
            }
        });
    });

    // 3. Close Modal Dialogs via Close ("❌") Button
    const closeModalButtons = document.querySelectorAll('.close-modal-btn');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('dialog');
            if (modal) {
                modal.close();
            }
        });
    });

    // 4. Close Dialog when clicking outside the content (Backdrop click)
    const modals = document.querySelectorAll('dialog.benefits-modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            const rect = modal.getBoundingClientRect();
            const isInDialog = (
                rect.top <= event.clientY &&
                event.clientY <= rect.top + rect.height &&
                rect.left <= event.clientX &&
                event.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                modal.close();
            }
        });
    });

    // 5. Footer Metadata Updates
    const currentYearEl = document.getElementById('currentYear');
    const lastModifiedEl = document.getElementById('lastModified');

    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    if (lastModifiedEl) {
        lastModifiedEl.textContent = document.lastModified;
    }
});