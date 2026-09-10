// MediKiosk Client-Side Script
document.addEventListener('DOMContentLoaded', () => {

  // Web Speech API Integration
  const micButtons = document.querySelectorAll('.btn-mic');

  micButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Web Speech API is not supported in this browser. Please use Chrome or Edge for voice input.");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = document.getElementById('preferredLanguage')?.value || 'en-US';

      btn.classList.add('recording');
      btn.innerHTML = '🎤 Listening... (Speak now)';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (targetInput) {
          targetInput.value = transcript;
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        btn.classList.remove('recording');
        btn.innerHTML = '🎤 Click to Speak';
      };

      recognition.onend = () => {
        btn.classList.remove('recording');
        btn.innerHTML = '🎤 Voice Input';
      };

      recognition.start();
    });
  });

  // Kiosk Registration Form Handler
  const regForm = document.getElementById('patientRegistrationForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(regForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const res = await response.json();
        if (res.success) {
          window.location.href = `/history/${res.patient_id}`;
        } else {
          alert('Error: ' + res.error);
        }
      } catch (err) {
        alert('Server communication error');
      }
    });
  }

  // Document Upload Dropzone
  const dropzone = document.getElementById('documentDropzone');
  const fileInput = document.getElementById('documentFile');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async () => {
      if (!fileInput.files.length) return;
      const file = fileInput.files[0];
      const patientId = document.getElementById('patientIdHolder')?.value;
      const docType = document.getElementById('docTypeSelect')?.value || 'Prescription';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('patient_id', patientId);
      formData.append('document_type', docType);

      const statusBox = document.getElementById('ocrStatusBox');
      if (statusBox) statusBox.innerHTML = '⏳ Scanning document and performing OCR text extraction...';

      try {
        const res = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData
        });
        const result = await res.json();
        if (result.success) {
          if (statusBox) {
            statusBox.innerHTML = `
              <div style="background: rgba(16,185,129,0.15); padding: 1rem; border-radius: 8px; border: 1px solid rgba(16,185,129,0.3);">
                <strong style="color: var(--accent-emerald);">✅ Document Uploaded & OCR Scanned!</strong><br>
                <small>${result.entities}</small>
                <details style="margin-top: 0.5rem;">
                  <summary style="cursor: pointer; color: var(--accent-cyan);">View Raw Extracted OCR Text</summary>
                  <pre style="margin-top: 0.5rem; background: #000; padding: 0.5rem; border-radius: 4px; white-space: pre-wrap; font-size: 0.85rem;">${result.extracted_text}</pre>
                </details>
              </div>
            `;
          }
        }
      } catch (err) {
        if (statusBox) statusBox.innerHTML = '❌ Upload failed.';
      }
    });
  }

  // Clinical History Questionnaire Submission
  const historyForm = document.getElementById('clinicalHistoryForm');
  if (historyForm) {
    historyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(historyForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/submit-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          const summaryContainer = document.getElementById('summaryOutputContainer');
          const summaryText = document.getElementById('summaryTextDisplay');
          
          if (summaryText) summaryText.innerText = result.summary;
          if (summaryContainer) summaryContainer.style.display = 'block';

          if (result.is_red_flag) {
            const alertBox = document.getElementById('emergencyAlertBanner');
            if (alertBox) {
              alertBox.style.display = 'flex';
              document.getElementById('redFlagReasonText').innerText = result.red_flag_reason;
            }
          }

          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      } catch (err) {
        alert('Failed to process clinical history.');
      }
    });
  }

});
