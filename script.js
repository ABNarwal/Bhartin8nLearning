// --- 1. Last Update Feature ---
const updateSpan = document.getElementById('lastUpdate');
if (updateSpan) {
    updateSpan.textContent = document.lastModified;
}

// --- 2. Bilingual Support System (English/Hindi) ---
let currentLang = 'en';
const langToggle = document.getElementById('langToggle');

if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`);
        });
    });
}

// --- 3. Speech-to-Text (Toggle Mic Facility) ---
let activeRecognition = null;
let activeMicButtonId = null;

// Expose the function globally so the HTML onclick attributes can find it
window.toggleDictation = function(inputId, btnId) {
    const btn = document.getElementById(btnId);
    
    if (!btn) {
        console.error("Mic button not found:", btnId);
        return;
    }

    // If the mic is currently active on THIS specific button, stop it
    if (activeRecognition && activeMicButtonId === btnId) {
        activeRecognition.stop();
        return;
    }

    // If the mic is active on a DIFFERENT button, stop that one first
    if (activeRecognition) {
        activeRecognition.stop();
    }

    if (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition')) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        activeRecognition = new SpeechRecognition();
        
        // Use Hindi if toggled, otherwise English
        activeRecognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN'; 
        activeRecognition.continuous = false;
        activeRecognition.interimResults = false;

        activeRecognition.onstart = function() {
            activeMicButtonId = btnId;
            btn.classList.add('listening');
            btn.textContent = "🛑"; // Change icon to Stop
        };

        activeRecognition.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            const inputField = document.getElementById(inputId);
            if (inputField) {
                // Append with a space if there's already text, otherwise replace
                inputField.value = inputField.value ? inputField.value + ' ' + transcript : transcript;
            }
        };

        activeRecognition.onend = function() {
            // Reset button styling and variables when listening ends
            btn.classList.remove('listening');
            btn.textContent = "🎤"; // Revert icon to Mic
            activeRecognition = null;
            activeMicButtonId = null;
        };

        activeRecognition.onerror = function(e) {
            console.error('Speech recognition error: ', e.error);
            alert('Speech recognition stopped: ' + e.error + '\nEnsure you are running this on localhost or HTTPS.');
            if (activeRecognition) {
                activeRecognition.stop();
            }
        };

        try {
            activeRecognition.start();
        } catch (error) {
            console.error("Could not start recognition:", error);
        }
        
    } else {
        alert("Your browser does not support the Web Speech API. Please use Chrome or Edge.");
    }
}

// --- 4. Registration Logic & n8n Integration (index.html) ---
const form = document.getElementById('registrationForm');
if (form) {
    // Check if deadline passed (July 15, 2026, 17:00:00)
    const deadline = new Date('2026-07-15T17:00:00');
    const now = new Date();
    
    if (now > deadline) {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('formMessage').textContent = "Registration is closed.";
        document.getElementById('formMessage').style.color = "red";
    }

    // Check if already registered in this browser
    if (localStorage.getItem('hackathon_registered') === 'true') {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('formMessage').textContent = "You have already submitted an entry.";
        document.getElementById('formMessage').style.color = "red";
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Data structure matching the n8n payload and Google Sheets schema exactly
        const payload = {
            "Student_name": document.getElementById('Student_name').value.trim(),
            "Email": document.getElementById('Email').value.trim().toLowerCase(),
            "Mobile": document.getElementById('Mobile').value.trim(),
            "College": document.getElementById('College').value.trim(),
            "Skills": document.getElementById('Skills').value.trim(),
            "Idea": document.getElementById('Idea').value.trim()
        };

        // WARNING: Replace with your actual n8n webhook URL before deploying
        const webhookURL = "https://YOUR_N8N_DOMAIN/webhook/3bc80916-6b30-451d-8edd-a8266e832f95"; 

        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');

        submitBtn.textContent = "Screening Idea & Submitting...";
        submitBtn.disabled = true;

        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) { 
                // Handles 200 OK responses (both SELECTED and REJECTED)
                localStorage.setItem('hackathon_registered', 'true');
                
                if (responseData.status === 'SELECTED') {
                    formMessage.textContent = "Registration Successful! You have been selected. Please check your email for the QR Code.";
                    formMessage.style.color = "green";
                } else if (responseData.status === 'REJECTED') {
                    formMessage.textContent = "Registration submitted successfully, but your idea was not shortlisted.";
                    formMessage.style.color = "orange";
                } else {
                    formMessage.textContent = "Registration submitted successfully.";
                    formMessage.style.color = "green";
                }

                submitBtn.textContent = "Submitted";
                form.reset();

            } else if (response.status === 409) {
                // Handles your custom 409 Duplicate response
                formMessage.textContent = responseData.message || "Student already registered with this Email or Mobile.";
                formMessage.style.color = "red";
                submitBtn.textContent = "Submit Registration";
                submitBtn.disabled = false;
            } else {
                throw new Error("Unexpected server response");
            }

        } catch (error) {
            console.error("Webhook Error:", error)}}}
