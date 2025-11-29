// Selecting DOM elements
const form = document.querySelector("#paymentForm");
const submitButton = document.querySelector("#submit");
const showQRButton = document.getElementById('showQRButton');
const showQR = document.getElementById('showQR');
const amountInput = document.getElementById('amountToPay');
const amountErrorMessage = document.getElementById('amountErrorMessage');
const nameInput = document.getElementById('name');
const noteInput = document.getElementById('note');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const paymentAmountDisplay = document.getElementById('paymentAmountDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');

// Disable right-click
document.addEventListener("contextmenu", e => e.preventDefault(), false);

// Retrieve URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const queryArray = queryString.split("&");
    queryArray.forEach(param => {
        const [key, value] = param.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
    return params;
}

// Auto-fill logic
document.addEventListener('DOMContentLoaded', prefillForm);

function prefillForm() {
    const urlParams = getUrlParams();
    if (urlParams['name']) nameInput.value = urlParams['name'];
    if (urlParams['am']) amountInput.value = urlParams['am'];
    if (urlParams['note']) noteInput.value = urlParams['note'];

    if (urlParams['name'] && urlParams['am'] && urlParams['note']) {
        submitButton.click();
    }
}

// Form Submission
form.addEventListener('submit', e => {
    e.preventDefault();
    
    if(!validateForm()) return;

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
    loadingOverlay.classList.remove('hidden');

    let requestBody = new FormData(form);

    fetch('https://script.google.com/macros/s/AKfycbxbPqP15KDrCXagGpCt7uyjbbsn8SrGX3fkw-ZPmUGut16IRUihC-dPjV21L0wkSDfL/exec', {
        method: 'POST',
        body: requestBody
    })
    .then(response => {
        if (response.ok) {
            // Update UI for Step 2
            document.getElementById('paymentForm').classList.add('hidden'); // Hide form
            step2.classList.remove('hidden'); // Show options
            paymentAmountDisplay.textContent = `₹${amountInput.value}`;
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        alert('Connection Error. Please check your internet.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Proceed to Pay <i class="fas fa-arrow-right"></i>';
        loadingOverlay.classList.add('hidden');
    });
});

// Validation
function validateForm() {
    if (amountInput.value && amountInput.value > 0) {
        amountErrorMessage.textContent = ''; 
        amountInput.classList.remove('invalid'); 
        return true;
    } else {
        amountErrorMessage.textContent = "Please enter a valid amount"; 
        amountInput.classList.add('invalid'); 
        return false;
    }
}

// Open UPI Links
function openUPILink(prefix) {
    if (validateForm()) {
        const enteredName = nameInput.value || "User";
        const enteredAmount = amountInput.value;
        const enteredNote = noteInput.value || "Payment";

        // YBL is usually versatile, but for specific apps we just need the string
        const basePaymentLink = `pay?pa=aryan9356@ybl&am=${enteredAmount}&tn=${encodeURIComponent(enteredNote)}&pn=${encodeURIComponent("Siddhivinayak Tidake")}`;
        
        const fullLink = `${prefix}${basePaymentLink}`;
        
        // Mobile deep linking fallback
        setTimeout(() => {
             // Optional: visual feedback that link was clicked
        }, 500);
        
        window.location.href = fullLink;
    }
}

// QR Code Generator
showQRButton.addEventListener('click', () => {    
    if (validateForm()) {
        loadingOverlay.classList.remove('hidden');
        
        const enteredName = nameInput.value;
        const enteredAmount = amountInput.value;
        const enteredNote = noteInput.value;

        const paymentLink = `upi://pay?pa=aryan9356@ybl&am=${enteredAmount}&tn=${encodeURIComponent(enteredNote)}`;
        const paymentQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`;

        const qrImg = document.getElementById('paymentQRCode');
        qrImg.src = paymentQR;

        qrImg.onload = () => {
            showQR.classList.remove('hidden');
            loadingOverlay.classList.add('hidden');
            // Scroll to QR
            showQR.scrollIntoView({ behavior: 'smooth' });
        };
    }
});
