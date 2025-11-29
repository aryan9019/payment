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

// Disable right-click context menu
document.addEventListener("contextmenu", e => e.preventDefault(), false);

// Helper: Generate a unique Transaction Reference (Required for "Authentic" links)
function generateTransactionId() {
    // Generates a random string: T + Timestamp + Random Chars
    return 'T' + Date.now() + Math.floor(Math.random() * 1000);
}

// Function to retrieve URL parameters
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

// Call prefillForm when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure loader is hidden on load
    loadingOverlay.classList.add('hidden'); 
    prefillForm();
});

// Function to prefill the form based on URL parameters
function prefillForm() {
    const urlParams = getUrlParams();

    if (urlParams['name']) nameInput.value = urlParams['name'];
    if (urlParams['am']) amountInput.value = urlParams['am'];
    if (urlParams['note']) noteInput.value = urlParams['note'];

    // Only auto-submit if ALL fields are present
    if (urlParams['name'] && urlParams['am'] && urlParams['note']) {
        setTimeout(() => {
             if(validateForm()) {
                 submitButton.click();
             }
        }, 500);
    }
}

// Form submission handling
form.addEventListener('submit', e => {
    e.preventDefault(); 
    
    if (!validateForm()) return;

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
            document.getElementById('paymentForm').classList.add('hidden');
            step2.classList.remove('hidden');
            paymentAmountDisplay.textContent = `₹${amountInput.value}`;
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        alert('Error! Unable to submit data. Please check your internet connection.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Proceed to Pay <i class="fas fa-arrow-right"></i>';
        loadingOverlay.classList.add('hidden');
    });
});

// Form validation
function validateForm() {
  if (amountInput.value && amountInput.value > 0) {
      amountErrorMessage.textContent = ''; 
      amountInput.classList.remove('invalid'); 
      return true;
  } else {
      amountErrorMessage.textContent = "Amount cannot be empty or zero"; 
      amountInput.classList.add('invalid'); 
      return false;
  }
}

// Function to construct the authentic UPI string
function getUPIString(enteredName, enteredAmount, enteredNote) {
    const tr = generateTransactionId(); // Unique Transaction Ref
    // Use standard UPI parameters:
    // pa = Payee Address
    // pn = Payee Name
    // am = Amount
    // tr = Transaction Ref (Makes it unique)
    // cu = Currency (INR)
    // tn = Note
    return `pay?pa=9307865271@naviaxis&pn=${encodeURIComponent("Aditya Laxman Bhole")}&am=${enteredAmount}&tr=${tr}&cu=INR&tn=${encodeURIComponent(enteredNote)}`;
}

// Function to open UPI link
function openUPILink(prefix) {
  if (validateForm()) {
    const enteredName = nameInput.value || "User";
    const enteredAmount = amountInput.value;
    const enteredNote = noteInput.value || "Payment";

    // Get the standard string
    const basePaymentLink = getUPIString(enteredName, enteredAmount, enteredNote);
    
    // Combine with the app prefix (e.g., phonepe://)
    const fullLink = `${prefix}${basePaymentLink}`;

    window.location.href = fullLink;
  }
}

// QR Code Logic
showQRButton.addEventListener('click', () => {    
  if (validateForm()) {
      loadingOverlay.classList.remove('hidden');

      const enteredName = nameInput.value;
      const enteredAmount = amountInput.value;
      const enteredNote = noteInput.value;

      // Create a standard UPI link for the QR code
      // We use the same getUPIString function to ensure the QR code also has the TR and CU tags
      const rawLink = getUPIString(enteredName, enteredAmount, enteredNote);
      const paymentLink = `upi://${rawLink}`;
      
      const paymentQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`;
      
      const qrImage = document.getElementById('paymentQRCode');
      qrImage.src = paymentQR;

      qrImage.onload = () => {
          showQR.classList.remove('hidden');
          loadingOverlay.classList.add('hidden');
          showQR.scrollIntoView({ behavior: 'smooth' });
      };
  }
});
