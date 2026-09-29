document.addEventListener('DOMContentLoaded', () => {
    // Extract parameters from the page URL query string
    const currentUrl = window.location.href;
    const formData = new URLSearchParams(currentUrl.substring(currentUrl.indexOf('?')));

    function showField(key, elementId) {
        const val = formData.get(key);
        const element = document.getElementById(elementId);
        if (element) {
            if (val) {
                if (key === 'timestamp') {
                    try {
                        const dateObj = new Date(val);
                        element.textContent = dateObj.toLocaleString();
                    } catch {
                        element.textContent = val;
                    }
                } else {
                    element.textContent = decodeURIComponent(val.replace(/\+/g, ' '));
                }
            } else {
                element.textContent = 'Not Provided';
            }
        }
    }

    // Populate required fields
    showField('fname', 'display-fname');
    showField('lname', 'display-lname');
    showField('email', 'display-email');
    showField('phone-number', 'display-phone');
    showField('organization', 'display-org');
    showField('timestamp', 'display-timestamp');
});