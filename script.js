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

window.toggleDictation = function(inputId, btnId) {
    const btn = document.getElementById(btnId);
    
    if (!btn) {
        console.error("Mic button not found:", btnId);
        return;
    }

    if (activeRecognition && activeMicButtonId === btnId) {
        activeRecognition.stop();
        return;
    }

    if (activeRecognition) {
        activeRecognition.stop();
    }

    if (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition')) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        activeRecognition = new SpeechRecognition();
        
        activeRecognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN'; 
        activeRecognition.continuous = false;
        activeRecognition.interimResults = false;

        activeRecognition.onstart = function() {
            activeMicButtonId = btnId;
            btn.classList.add('listening');
            btn.textContent = "🛑"; 
        };

        activeRecognition.onresult = function(e) {
            const transcript = e.results[0][0].transcript;
            const inputField = document.getElementById(inputId);
            if (inputField) {
                inputField.value = inputField.value ? inputField.value + ' ' + transcript : transcript;
            }
        };

        activeRecognition.onend = function() {
            btn.classList.remove('listening');
            btn.textContent = "🎤"; 
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
};

// --- 4. Registration Logic & n8n Integration (index.html) ---
const form = document.getElementById('registrationForm');
if (form) {
    const deadline = new Date('2026-07-15T17:00:00');
    const now = new Date();
    
    if (now > deadline) {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('formMessage').textContent = "Registration is closed.";
        document.getElementById('formMessage').style.color = "red";
    }

    if (localStorage.getItem('hackathon_registered') === 'true') {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('formMessage').textContent = "You have already submitted an entry.";
        document.getElementById('formMessage').style.color = "red";
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const payload = {
            "Student_name": document.getElementById('Student_name').value.trim(),
            "Email": document.getElementById('Email').value.trim().toLowerCase(),
            "Mobile": document.getElementById('Mobile').value.trim(),
            "College": document.getElementById('College').value.trim(),
            "Skills": document.getElementById('Skills').value.trim(),
            "Idea": document.getElementById('Idea').value.trim()
        };

        // WARNING: Replace with your actual n8n webhook URL
        const webhookURL = "https://bhartiamit0703july07.app.n8n.cloud/webhook/3bc80916-6b30-451d-8edd-a8266e832f95"; 

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
                formMessage.textContent = responseData.message || "Student already registered with this Email or Mobile.";
                formMessage.style.color = "red";
                submitBtn.textContent = "Submit Registration";
                submitBtn.disabled = false;
            } else {
                throw new Error("Unexpected server response");
            }

        } catch (error) {
            console.error("Webhook Error:", error);
            formMessage.textContent = "Error connecting to server. Please try again.";
            formMessage.style.color = "red";
            submitBtn.textContent = "Submit Registration";
            submitBtn.disabled = false;
        }
    });
}

// --- 5. Support Form & AI Enhancement Logic (support.html) ---

// A. "Enhance with AI" Button Logic
const enhanceAiBtn = document.getElementById('enhanceAiBtn');
if (enhanceAiBtn) {
    enhanceAiBtn.addEventListener('click', async function() {
        const descField = document.getElementById('issue_description');
        const rawText = descField.value.trim();
        
        if (!rawText) {
            alert("Please jot down some rough notes first before enhancing!");
            return;
        }

        const selectedAI = document.querySelector('input[name="ai_model"]:checked').value;
        const originalBtnText = enhanceAiBtn.textContent;

        enhanceAiBtn.textContent = `✨ Enhancing with ${selectedAI}...`;
        enhanceAiBtn.disabled = true;
     
        try {
            // WARNING: Replace with your actual AI Enhancement Webhook URL
           const aiWebhookURL = "https://bhartiamit0703july07.app.n8n.cloud/webhook-test/enhance-support-text";
            
            const response = await fetch(aiWebhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    raw_text: rawText, 
                    ai_model: selectedAI 
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                const suggestionGroup = document.getElementById('ai_suggestion_group');
                const enhancedField = document.getElementById('enhanced_description');
                
                suggestionGroup.style.display = 'block';
                enhancedField.value = data.enhanced_text || data.text || "AI format error. Please try again.";
                enhancedField.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error("AI Enhance Error:", error);
            alert("Failed to connect to AI webhook. Check console.");
        } finally {
            enhanceAiBtn.textContent = originalBtnText;
            enhanceAiBtn.disabled = false;
        }
    });
}

// B. Final Support Ticket Submission Logic
const supportForm = document.getElementById('supportForm');
if (supportForm) {
    supportForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btn = document.getElementById('supportSubmitBtn');
        const msg = document.getElementById('supportMessage');

        const suggestionGroup = document.getElementById('ai_suggestion_group');
        const enhancedField = document.getElementById('enhanced_description');
        let finalDescription = document.getElementById('issue_description').value.trim();

        if (suggestionGroup.style.display !== 'none' && enhancedField.value.trim() !== "") {
            finalDescription = enhancedField.value.trim();
        }

        const supportPayload = {
            name: document.getElementById('support_name').value.trim(),
            email: document.getElementById('support_email').value.trim(),
            category: document.getElementById('issue_category').value.trim(),
            description: finalDescription,
            ai_used: document.querySelector('input[name="ai_model"]:checked').value
        };

        btn.textContent = "Sending Request...";
        btn.disabled = true;

        try {
            // WARNING: Replace with your Final Support Ticket Webhook URL
            const supportWebhookURL = "https://bhartiamit0703july07.app.n8n.cloud/webhook/ba0249f3-9d8f-456c-b646-37ab5f24e72d";
            
            const response = await fetch(supportWebhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supportPayload)
            });

            if (response.ok) {
                msg.textContent = "Support request submitted successfully.";
                msg.style.color = "green";
                btn.textContent = "Request Sent";
                
                supportForm.reset();
                suggestionGroup.style.display = 'none';
            } else {
                throw new Error("Server error");
            }
        } catch (error) {
            console.error("Support Submission Error:", error);
            msg.textContent = "Error submitting request. Please try again.";
            msg.style.color = "red";
            
            btn.textContent = "Submit Request";
            btn.disabled = false;
        }
    });
}
