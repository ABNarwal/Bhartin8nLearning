// --- 1. Last Update Feature ---
document.getElementById('lastUpdate').textContent = document.lastModified;

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

// --- 5. Support Form Logic ---
const supportForm = document.getElementById('supportForm');

if (supportForm) {
    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Capture data
        const supportData = {
            name: document.getElementById('support_name').value.trim(),
            email: document.getElementById('support_email').value.trim(),
            category: document.getElementById('issue_category').value.trim(),
            description: document.getElementById('issue_description').value.trim()
        };

        const btn = document.getElementById('supportSubmitBtn');
        const msg = document.getElementById('supportMessage');

        btn.textContent = "Sending...";
        btn.disabled = true;

        // Simulate sending to webhook/server
        setTimeout(() => {
            msg.textContent = "Support request submitted successfully. Our team will assist you shortly.";
            msg.style.color = "green";
            btn.textContent = "Request Sent";
            supportForm.reset();
        }, 1000);
    });
}

// --- 3. Speech-to-Text (Mic Facility) ---
function startDictation(elementId) {
    if (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition')) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Use Hindi if toggled, otherwise English
        recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN'; 
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.start();

        recognition.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            const inputField = document.getElementById(elementId);
            // Append with a space if there's already text, otherwise replace
            inputField.value = inputField.value ? inputField.value + ' ' + transcript : transcript;
            recognition.stop();
        };

        recognition.onerror = function(e) {
            alert('Speech recognition failed: ' + e.error);
            recognition.stop();
        };
    } else {
        alert("Your browser does not support the Web Speech API. Please use Chrome or Edge.");
    }
}

// --- 4. Registration Logic & n8n Integration ---
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

    // Check if already registered (Single entry limit)
    if (localStorage.getItem('hackathon_registered') === 'true') {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('formMessage').textContent = "You have already submitted an entry.";
        document.getElementById('formMessage').style.color = "red";
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Data cleanup mapping to your required structure
        const payload = {
            "student_name": document.getElementById('student_name').value.trim(),
            "contact_email": document.getElementById('contact_email').value.trim().toLowerCase(),
            "mobile_number": document.getElementById('mobile_number').value.trim(),
            "college": document.getElementById('college').value.trim(),
            "raw_skills": document.getElementById('raw_skills').value.trim(),
            "hackathon_idea": document.getElementById('hackathon_idea').value.trim()
        };

        const webhookURL = "YOUR_N8N_WEBHOOK_URL_HERE"; // <-- Replace with actual n8n URL

        try {
            document.getElementById('submitBtn').textContent = "Submitting...";
            
            // Uncomment the fetch block below when you add your n8n URL
            /*
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            */
            
            // Simulating successful n8n dispatch for now
            setTimeout(() => {
                localStorage.setItem('hackathon_registered', 'true');
                document.getElementById('formMessage').textContent = "Registration successful! Data sent to n8n.";
                document.getElementById('formMessage').style.color = "green";
                document.getElementById('submitBtn').disabled = true;
                document.getElementById('submitBtn').textContent = "Submitted";
                form.reset();
            }, 1000);

        } catch (error) {
            document.getElementById('formMessage').textContent = "Error connecting to server.";
            document.getElementById('formMessage').style.color = "red";
            document.getElementById('submitBtn').textContent = "Submit Registration";
        }
    });
}
