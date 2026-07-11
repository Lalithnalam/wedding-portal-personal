document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation & Views ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const formScreen = document.getElementById('form-screen');
    const thankYouScreen = document.getElementById('thank-you-screen');
    const btnGetStarted = document.getElementById('btn-get-started');
    const wishesForm = document.getElementById('wishes-form');
    
    // --- Multi-Step Logic ---
    const steps = document.querySelectorAll('.form-step');
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    const btnSubmitFinal = document.getElementById('btn-submit-final');
    const btnSubmitEarly = document.getElementById('btn-submit-early');
    const btnContinueOptional = document.getElementById('btn-continue-optional');
    
    // --- Relationship Toggle Logic ---
    const relationshipSelect = document.getElementById('relationship');
    const otherRelationshipGroup = document.getElementById('other-relationship-group');
    const otherRelationshipInput = document.getElementById('other-relationship');

    if (relationshipSelect) {
        relationshipSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Other') {
                otherRelationshipGroup.style.display = 'block';
                otherRelationshipInput.setAttribute('required', 'true');
            } else {
                otherRelationshipGroup.style.display = 'none';
                otherRelationshipInput.removeAttribute('required');
                otherRelationshipInput.value = '';
            }
        });
    }
    
    const progressBar = document.getElementById('form-progress');
    const stepIndicator = document.getElementById('step-indicator');
    const formNavFooter = document.querySelector('.form-navigation-footer');
    
    let currentStep = 1;
    let totalSteps = 4; // Checkpoint is step 4. Will expand to 6 if they continue.
    
    // Check if step 5/6 exist
    const hasOptionalSteps = document.querySelector('.form-step[data-step="5"]') !== null;

    btnGetStarted.addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        formScreen.classList.add('active');
        updateStepUI();
        window.scrollTo(0, 0);
    });

    const updateStepUI = () => {
        // Hide all steps, show current
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Calculate progress percentage based on total Steps 
        const progressPercentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update Step text (Optional steps logic)
        if (currentStep <= 4) {
            stepIndicator.textContent = `Step ${currentStep} of 4 (Mandatory)`;
        } else {
            stepIndicator.textContent = `Step ${currentStep} of ${totalSteps} (Optional)`;
        }

        // Nav Footer Visibility Logic
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        
        if (currentStepEl.classList.contains('checkpoint-step')) {
            formNavFooter.style.display = 'none'; // Hide footer on checkpoint
        } else {
            formNavFooter.style.display = 'flex';
            
            // Back button
            btnBack.style.display = currentStep > 1 ? 'block' : 'none';
            
            // Next vs Submit Final
            if (currentStep === totalSteps && currentStep > 4) {
                btnNext.style.display = 'none';
                btnSubmitFinal.style.display = 'block';
            } else {
                btnNext.style.display = 'block';
                btnSubmitFinal.style.display = 'none';
            }
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Validation for current step only
    const validateCurrentStep = () => {
        let isValid = true;
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        
        // Remove old errors
        currentStepEl.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));

        // Check required fields in THIS step only
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            const errorMsgEl = formGroup ? formGroup.querySelector('.error-message') : null;

            if (field.type === 'radio') {
                const groupName = field.name;
                const checked = currentStepEl.querySelector(`input[name="${groupName}"]:checked`);
                if (!checked) {
                    isValid = false;
                    if (formGroup) formGroup.classList.add('has-error');
                }
            } else if (!field.value.trim()) {
                isValid = false;
                if (formGroup) {
                    formGroup.classList.add('has-error');
                    if (errorMsgEl) errorMsgEl.textContent = 'This field is required.';
                }
            } else if (field.tagName === 'TEXTAREA' && field.value.trim().length < 5) {
                isValid = false;
                if (formGroup) {
                    formGroup.classList.add('has-error');
                    if (errorMsgEl) errorMsgEl.textContent = 'Please write at least 5 characters.';
                }
            }
        });

        if (!isValid) {
            const firstError = currentStepEl.querySelector('.has-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    };

    btnNext.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStep++;
            updateStepUI();
        }
    });

    btnBack.addEventListener('click', () => {
        currentStep--;
        updateStepUI();
    });

    // Checkpoint Actions
    btnSubmitEarly.addEventListener('click', () => {
        submitForm();
    });

    btnContinueOptional.addEventListener('click', () => {
        totalSteps = 6; // Reveal remaining steps
        currentStep++;
        updateStepUI();
    });


    // Form Submission
    const submitForm = async () => {
        const prevText = btnSubmitFinal.textContent;
        btnSubmitFinal.disabled = true;
        btnSubmitFinal.textContent = "Sending wishes...";
        if(btnSubmitEarly) {
            btnSubmitEarly.disabled = true;
            btnSubmitEarly.textContent = "Sending wishes...";
        }

        try {
            const formData = new FormData();
            
            // Basic fields
            formData.append('guestName', document.getElementById('guest-name').value);
            
            const sideEl = document.querySelector('input[name="weddingSide"]:checked');
            if (sideEl) formData.append('side', sideEl.value);
            
            let relationshipVal = document.getElementById('relationship').value;
            if (relationshipVal === 'Other') {
                relationshipVal = document.getElementById('other-relationship').value;
            }
            formData.append('relationship', relationshipVal);
            
            const isAnonymous = document.querySelector('input[name="identityPref"]:checked').value === 'anonymous';
            formData.append('isAnonymous', isAnonymous);
            
            formData.append('blessingMeter', document.getElementById('blessing-meter').value);
            formData.append('wishes', document.getElementById('wish-text').value);
            formData.append('marriageDos', document.getElementById('advice-do').value);
            formData.append('marriageDonts', document.getElementById('advice-dont').value);
            
            const favMemory = document.getElementById('favorite-memory');
            if(favMemory) formData.append('favoriteMemory', favMemory.value);

            // Predictions
            const predictionCheckboxes = document.querySelectorAll('input[name="predictions"]:checked');
            const predictions = Array.from(predictionCheckboxes).map(cb => cb.value);
            formData.append('predictions', JSON.stringify(predictions));
            
            const customPred = document.getElementById('custom-prediction');
            if(customPred) formData.append('customPrediction', customPred.value);
            
            const addMsg = document.getElementById('additional-message');
            if(addMsg) formData.append('additionalMessage', addMsg.value);

            // Audio Note
            if (typeof audioBlob !== 'undefined' && audioBlob) {
                formData.append('voiceNote', audioBlob, 'voicenote.webm');
            }
            
            // Photos
            if (uploadedFiles && uploadedFiles.length > 0) {
                uploadedFiles.forEach(file => {
                    formData.append('photos', file);
                });
            }

            const response = await fetch('/api/submissions', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const guestName = result.data.guestName;
                const dynamicName = document.getElementById('dynamic-thank-you');
                if (result.data.isAnonymous) {
                    dynamicName.innerHTML = `Your beautiful wishes have been anonymously added to our collection.`;
                } else {
                    dynamicName.innerHTML = `Thank you, <strong style="color:var(--sage-green); font-family:var(--font-heading)">${guestName}</strong>!<br>Your beautiful wishes have been added to our collection.`;
                }

                formScreen.classList.remove('active');
                thankYouScreen.classList.add('active');
                window.scrollTo(0, 0);
            } else {
                alert("Could not submit: " + (result.errors ? result.errors.join(', ') : result.message));
            }

        } catch (error) {
            console.error(error);
            alert("A network error occurred. Please try again.");
        } finally {
            btnSubmitFinal.disabled = false;
            btnSubmitFinal.textContent = prevText;
            if(btnSubmitEarly) {
                btnSubmitEarly.disabled = false;
                btnSubmitEarly.textContent = "Submit My Wishes Now";
            }
        }
    };

    wishesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // At this point (Submit Final button), step 6 validation
        if (validateCurrentStep()) {
            submitForm();
        }
    });


    // --- Slider / Emoji Interaction ---
    const blessingMeter = document.getElementById('blessing-meter');
    const emojis = document.querySelectorAll('.emoji-icon');

    const updateEmojiSelection = (value) => {
        emojis.forEach(emoji => {
            if (parseInt(emoji.dataset.val) === parseInt(value)) {
                emoji.classList.add('active');
            } else {
                emoji.classList.remove('active');
            }
        });
    };

    if(blessingMeter) {
        blessingMeter.addEventListener('input', (e) => {
            updateEmojiSelection(e.target.value);
        });

        emojis.forEach(emoji => {
            emoji.addEventListener('click', () => {
                const val = emoji.dataset.val;
                blessingMeter.value = val;
                updateEmojiSelection(val);
            });
        });
    }

    // --- Identity Preference Toggle Styling ---
    const identityCards = document.querySelectorAll('.toggle-card input[type="radio"]');
    identityCards.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.toggle-card').forEach(card => card.classList.remove('active'));
            if(e.target.checked) {
                e.target.closest('.toggle-card').classList.add('active');
            }
        });
    });

    // --- Voice Message Recorder (Native) ---
    const btnRecord = document.getElementById('btn-record');
    const btnPlayback = document.getElementById('btn-playback');
    const audioControls = document.querySelector('.audio-controls');
    const timerDisplay = document.getElementById('audio-timer');
    const audioActions = document.getElementById('audio-actions');
    const btnRemoveAudio = document.getElementById('btn-remove-audio');
    const btnRerecord = document.getElementById('btn-rerecord');
    
    let isRecording = false;
    let recordInterval;
    let seconds = 0;
    
    let mediaRecorder;
    let audioChunks = [];
    // Important: make audioBlob global to the submitForm scope (it's declared here)
    window.audioBlob = null; 
    let audioUrl = null;
    let audioPlayer = null;

    const updateTimerDisplay = () => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        if(timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    };

    const stopRecording = () => {
        isRecording = false;
        clearInterval(recordInterval);
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if(btnRecord) {
            btnRecord.classList.remove('recording');
            btnRecord.innerHTML = '<span class="record-dot"></span> Record';
            btnRecord.style.display = 'none';
        }
    };

    if(btnRecord) {
        btnRecord.addEventListener('click', async () => {
            if (!isRecording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        window.audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        audioUrl = URL.createObjectURL(window.audioBlob);
                        
                        // Create and show audio player
                        if (audioPlayer) audioPlayer.remove();
                        audioPlayer = document.createElement('audio');
                        audioPlayer.controls = true;
                        audioPlayer.src = audioUrl;
                        audioPlayer.style.width = '100%';
                        audioPlayer.style.marginTop = '10px';
                        
                        // Replace the playback button area with the actual player
                        if(btnPlayback) btnPlayback.style.display = 'none';
                        audioControls.appendChild(audioPlayer);
                        
                        if(audioActions) audioActions.classList.remove('hidden');
                        
                        // Stop all tracks to release microphone
                        stream.getTracks().forEach(track => track.stop());
                    };
                    
                    mediaRecorder.start();
                    isRecording = true;
                    seconds = 0;
                    updateTimerDisplay();
                    btnRecord.classList.add('recording');
                    btnRecord.innerHTML = '<span class="record-dot"></span> Stop';
                    
                    recordInterval = setInterval(() => {
                        seconds++;
                        updateTimerDisplay();
                        if (seconds >= 120) stopRecording();
                    }, 1000);
                } catch (err) {
                    alert('Microphone access is required to record a voice message.');
                    console.error('Error accessing microphone:', err);
                }
            } else {
                stopRecording();
            }
        });
    }

    const resetAudio = () => {
        window.audioBlob = null;
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            audioUrl = null;
        }
        if (audioPlayer) {
            audioPlayer.remove();
            audioPlayer = null;
        }
        seconds = 0;
        updateTimerDisplay();
        
        if(btnPlayback) {
            btnPlayback.style.display = 'inline-block';
            btnPlayback.disabled = true;
        }
        
        if(audioActions) audioActions.classList.add('hidden');
        if(btnRecord) btnRecord.style.display = 'inline-block';
    };

    if(btnRemoveAudio) btnRemoveAudio.addEventListener('click', resetAudio);
    if(btnRerecord) btnRerecord.addEventListener('click', () => {
        resetAudio();
        btnRecord.click();
    });

    // --- Photo Upload Simulation ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const slots = [
        document.getElementById('slot-1'),
        document.getElementById('slot-2'),
        document.getElementById('slot-3')
    ];
    let uploadedFiles = [];

    if(dropZone && fileInput) {
        dropZone.addEventListener('click', (e) => {
            if (e.target.closest('.remove-photo-btn')) return;
            fileInput.click();
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleFiles(e.target.files);
        });
    }

    const handleFiles = (files) => {
        const newFiles = Array.from(files).filter(file => file.type.match('image.*') && file.size <= 10 * 1024 * 1024);
        const spaceLeft = 3 - uploadedFiles.length;
        const filesToAdd = newFiles.slice(0, spaceLeft);
        
        filesToAdd.forEach(file => uploadedFiles.push(file));
        updateThumbnails();
    };

    const updateThumbnails = () => {
        slots.forEach((slot, index) => {
            if(!slot) return;
            slot.className = 'slot empty-slot';
            slot.innerHTML = '<i class="fa-solid fa-plus"></i>';
            slot.style.backgroundImage = '';
            
            if (uploadedFiles[index]) {
                const file = uploadedFiles[index];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    slot.classList.remove('empty-slot');
                    slot.classList.add('filled');
                    slot.style.backgroundImage = `url(${e.target.result})`;
                    
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'remove-photo-btn';
                    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    removeBtn.onclick = (event) => {
                        event.stopPropagation();
                        removePhoto(index);
                    };
                    slot.appendChild(removeBtn);
                };
                
                reader.readAsDataURL(file);
            }
        });
    };

    const removePhoto = (index) => {
        uploadedFiles.splice(index, 1);
        updateThumbnails();
    };
});
