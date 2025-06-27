// Global variables
let bookingData = {
    roomDays: 1,
    selectedDays: [],
    meals: {
        day1: { breakfast: false, lunch: false, dinner: false },
        day2: { breakfast: false, lunch: false, dinner: false },
        day3: { breakfast: false, lunch: false, dinner: false }
    },
    participantName: '',
    participantEmail: '',
    participantAge: null,
    ageCategory: '',
    registrationFee: 0
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateSummary();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Room days input
    const roomDaysInput = document.getElementById('roomDays');
    roomDaysInput.addEventListener('change', handleRoomDaysChange);

    // Day checkboxes for accommodation
    const dayCheckboxes = document.querySelectorAll('.day-option input[type="checkbox"]');
    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleDaySelectionChange);
    });

    // Meal checkboxes
    const mealCheckboxes = document.querySelectorAll('.meal-option input[type="checkbox"]');
    mealCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleMealSelectionChange);
    });

    // Personal information inputs
    const nameInput = document.getElementById('participantName');
    const emailInput = document.getElementById('participantEmail');
    const ageInput = document.getElementById('participantAge');
    
    nameInput.addEventListener('input', handlePersonalInfoChange);
    emailInput.addEventListener('input', handlePersonalInfoChange);
    ageInput.addEventListener('input', handleAgeChange);

    // Initialize first day as selected by default
    document.getElementById('day1').checked = true;
    bookingData.selectedDays = [1];
    updateDaySelectionUI();
}

// Handle room days input change
function handleRoomDaysChange(event) {
    const value = parseInt(event.target.value);
    bookingData.roomDays = value;
    
    // Auto-select days based on number input
    const dayCheckboxes = document.querySelectorAll('.day-option input[type="checkbox"]');
    dayCheckboxes.forEach((checkbox, index) => {
        checkbox.checked = index < value;
    });
    
    // Update selected days array
    bookingData.selectedDays = [];
    for (let i = 1; i <= value; i++) {
        bookingData.selectedDays.push(i);
    }
    
    updateDaySelectionUI();
    updateSummary();
}

// Handle day selection change
function handleDaySelectionChange(event) {
    const dayValue = parseInt(event.target.value);
    
    if (event.target.checked) {
        if (!bookingData.selectedDays.includes(dayValue)) {
            bookingData.selectedDays.push(dayValue);
        }
    } else {
        bookingData.selectedDays = bookingData.selectedDays.filter(day => day !== dayValue);
    }
    
    // Update room days input to match selection
    bookingData.roomDays = bookingData.selectedDays.length;
    document.getElementById('roomDays').value = bookingData.roomDays;
    
    updateDaySelectionUI();
    updateSummary();
}

// Handle meal selection change
function handleMealSelectionChange(event) {
    const id = event.target.id;
    const [day, meal] = id.split('-');
    
    bookingData.meals[day][meal] = event.target.checked;
    
    // Update meal option UI
    const mealOption = event.target.closest('.meal-option');
    if (event.target.checked) {
        mealOption.classList.add('selected');
    } else {
        mealOption.classList.remove('selected');
    }
    
    updateSummary();
}

// Handle personal information change
function handlePersonalInfoChange(event) {
    const id = event.target.id;
    const value = event.target.value;
    
    if (id === 'participantName') {
        bookingData.participantName = value;
    } else if (id === 'participantEmail') {
        bookingData.participantEmail = value;
    }
    
    updateSummary();
}

// Handle age change
function handleAgeChange(event) {
    const age = parseInt(event.target.value);
    bookingData.participantAge = age;
    
    // Determine age category and registration fee
    if (age >= 18) {
        bookingData.ageCategory = 'Adult (18+)';
        bookingData.registrationFee = 50;
        updateAgeCategoryDisplay('adult', 'Adult (18+) - $50 Registration Fee');
    } else if (age >= 3) {
        bookingData.ageCategory = 'Youth (3-18)';
        bookingData.registrationFee = 25;
        updateAgeCategoryDisplay('youth', 'Youth (3-18) - $25 Registration Fee');
    } else if (age >= 0) {
        bookingData.ageCategory = 'Child (Under 3)';
        bookingData.registrationFee = 0;
        updateAgeCategoryDisplay('child', 'Child (Under 3) - FREE Registration');
    } else {
        bookingData.ageCategory = '';
        bookingData.registrationFee = 0;
        updateAgeCategoryDisplay('default', 'Age category will appear here');
    }
    
    updateSummary();
}

// Update age category display
function updateAgeCategoryDisplay(category, text) {
    const display = document.getElementById('ageCategoryDisplay');
    const span = display.querySelector('.age-category');
    
    // Remove all category classes
    display.classList.remove('adult', 'youth', 'child', 'default');
    // Add the new category class
    display.classList.add(category);
    
    span.textContent = text;
}

// Update day selection UI
function updateDaySelectionUI() {
    const dayOptions = document.querySelectorAll('.day-option');
    
    dayOptions.forEach((option, index) => {
        const dayNumber = index + 1;
        const checkbox = option.querySelector('input[type="checkbox"]');
        
        if (bookingData.selectedDays.includes(dayNumber)) {
            option.classList.add('selected');
            checkbox.checked = true;
        } else {
            option.classList.remove('selected');
            checkbox.checked = false;
        }
    });
}

// Calculate total meals
function calculateTotalMeals() {
    let total = 0;
    Object.values(bookingData.meals).forEach(dayMeals => {
        Object.values(dayMeals).forEach(meal => {
            if (meal) total++;
        });
    });
    return total;
}

// Get selected meal details
function getSelectedMealDetails() {
    const details = [];
    
    Object.entries(bookingData.meals).forEach(([day, meals]) => {
        const dayNumber = day.replace('day', '');
        Object.entries(meals).forEach(([meal, selected]) => {
            if (selected) {
                details.push(`Day ${dayNumber}: ${meal.charAt(0).toUpperCase() + meal.slice(1)}`);
            }
        });
    });
    
    return details;
}

// Update booking summary
function updateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    const totalMeals = calculateTotalMeals();
    const mealDetails = getSelectedMealDetails();
    
    let summaryHTML = '';
    
    if (bookingData.participantName || bookingData.participantEmail || bookingData.participantAge || bookingData.selectedDays.length > 0 || totalMeals > 0) {
        summaryHTML = '<div class="summary-items">';
        
        // Personal Information
        if (bookingData.participantName) {
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-user"></i> Name:</span>
                    <span>${bookingData.participantName}</span>
                </div>
            `;
        }
        
        if (bookingData.participantEmail) {
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-envelope"></i> Email:</span>
                    <span>${bookingData.participantEmail}</span>
                </div>
            `;
        }
        
        // Age and Registration Fee
        if (bookingData.participantAge !== null && !isNaN(bookingData.participantAge)) {
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-birthday-cake"></i> Age:</span>
                    <span>${bookingData.participantAge} years old</span>
                </div>
            `;
            
            if (bookingData.ageCategory) {
                summaryHTML += `
                    <div class="summary-item">
                        <span><i class="fas fa-tag"></i> Category:</span>
                        <span>${bookingData.ageCategory}</span>
                    </div>
                `;
            }
        }
        
        // Accommodation
        if (bookingData.selectedDays.length > 0) {
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-bed"></i> Room Days:</span>
                    <span>${bookingData.selectedDays.length} days (Day ${bookingData.selectedDays.join(', ')})</span>
                </div>
            `;
        }
        
        // Meals
        if (totalMeals > 0) {
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-utensils"></i> Total Meals:</span>
                    <span>${totalMeals} meals</span>
                </div>
            `;
            
            if (mealDetails.length > 0) {
                summaryHTML += `
                    <div class="summary-item">
                        <span>Meal Details:</span>
                        <div style="text-align: right;">
                            ${mealDetails.map(detail => `<div style="font-size: 0.9em; color: #6b7280;">${detail}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        // Conference fee notice
        summaryHTML += `
            <div class="summary-item" style="background: #f0f9ff; padding: 10px; border-radius: 8px; margin: 10px 0;">
                <span><i class="fas fa-info-circle" style="color: #0369a1;"></i> Conference:</span>
                <span style="color: #059669; font-weight: 600;">FREE</span>
            </div>
        `;
        
        // Registration fee
        if (bookingData.participantAge !== null && !isNaN(bookingData.participantAge)) {
            const feeColor = bookingData.registrationFee === 0 ? '#059669' : '#667eea';
            const feeText = bookingData.registrationFee === 0 ? 'FREE' : `$${bookingData.registrationFee}`;
            
            summaryHTML += `
                <div class="summary-item">
                    <span><i class="fas fa-dollar-sign"></i> Registration Fee:</span>
                    <span style="color: ${feeColor}; font-weight: 600; font-size: 1.1rem;">${feeText}</span>
                </div>
            `;
        }
        
        summaryHTML += '</div>';
    } else {
        summaryHTML = '<p>Fill in your information to see the registration summary</p>';
    }
    
    summaryContent.innerHTML = summaryHTML;
}

// Validate form before submission
function validateForm() {
    const errors = [];
    
    if (!bookingData.participantName.trim()) {
        errors.push('Please enter your full name');
    }
    
    if (!bookingData.participantEmail.trim()) {
        errors.push('Please enter your email address');
    } else if (!isValidEmail(bookingData.participantEmail)) {
        errors.push('Please enter a valid email address');
    }
    
    if (bookingData.participantAge === null || isNaN(bookingData.participantAge) || bookingData.participantAge < 0) {
        errors.push('Please enter a valid age');
    }
    
    if (bookingData.selectedDays.length === 0) {
        errors.push('Please select at least one day for accommodation');
    }
    
    const totalMeals = calculateTotalMeals();
    if (totalMeals === 0) {
        errors.push('Please select at least one meal');
    }
    
    return errors;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show success message
function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message show';
    const feeText = bookingData.registrationFee === 0 ? 'FREE registration' : `$${bookingData.registrationFee} registration fee`;
    
    successMessage.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Registration Submitted Successfully!</h3>
        <p>Thank you, ${bookingData.participantName}! Your conference registration has been received.</p>
        <p>Registration Category: ${bookingData.ageCategory} - ${feeText}</p>
        <p>A confirmation email will be sent to ${bookingData.participantEmail}</p>
    `;
    
    document.querySelector('.booking-form').appendChild(successMessage);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// Show error messages
function showErrorMessages(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.cssText = `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 20px;
    `;
    
    errorContainer.innerHTML = `
        <h4><i class="fas fa-exclamation-triangle"></i> Please fix the following errors:</h4>
        <ul style="margin: 10px 0 0 20px;">
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
    `;
    
    document.querySelector('.form-actions').insertBefore(errorContainer, document.querySelector('.form-actions').firstChild);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        errorContainer.remove();
    }, 5000);
}

// Submit booking function
function submitBooking() {
    const errors = validateForm();
    
    if (errors.length > 0) {
        showErrorMessages(errors);
        return;
    }
    
    // Simulate API call
    const submitButton = document.querySelector('.btn-primary');
    const originalText = submitButton.innerHTML;
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        // Save registration data to localStorage
        saveRegistrationData(bookingData);
        
        console.log('Registration Data:', bookingData);
        showSuccessMessage();
        
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Reset form after successful submission
        setTimeout(() => {
            resetForm();
        }, 3000);
    }, 2000);
}

// Save registration data to localStorage
function saveRegistrationData(data) {
    const storageKey = 'conferenceRegistrations';
    let registrations = [];
    
    // Load existing registrations
    const existing = localStorage.getItem(storageKey);
    if (existing) {
        registrations = JSON.parse(existing);
    }
    
    // Add new registration with timestamp and ID
    const registration = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...data
    };
    
    registrations.push(registration);
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(registrations));
    
    return registration;
}

// Reset form function
function resetForm() {
    // Reset data
    bookingData = {
        roomDays: 1,
        selectedDays: [1],
        meals: {
            day1: { breakfast: false, lunch: false, dinner: false },
            day2: { breakfast: false, lunch: false, dinner: false },
            day3: { breakfast: false, lunch: false, dinner: false }
        },
        participantName: '',
        participantEmail: '',
        participantAge: null,
        ageCategory: '',
        registrationFee: 0
    };
    
    // Reset form inputs
    document.getElementById('roomDays').value = 1;
    document.getElementById('participantName').value = '';
    document.getElementById('participantEmail').value = '';
    document.getElementById('participantAge').value = '';
    
    // Reset age category display
    updateAgeCategoryDisplay('default', 'Age category will appear here');
    
    // Reset checkboxes
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Set day 1 as default
    document.getElementById('day1').checked = true;
    
    // Reset UI classes
    const selectedElements = document.querySelectorAll('.selected');
    selectedElements.forEach(element => {
        element.classList.remove('selected');
    });
    
    // Update UI
    updateDaySelectionUI();
    updateSummary();
    
    // Remove any messages
    const messages = document.querySelectorAll('.success-message, .error-message');
    messages.forEach(message => message.remove());
}

// Add some dynamic time display
function updateConferenceTime() {
    const now = new Date();
    const conferenceStart = new Date();
    conferenceStart.setHours(6, 27, 0, 0); // 6:27 AM
    
    const timeElement = document.querySelector('.header-content p');
    if (timeElement) {
        const timeString = conferenceStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        timeElement.textContent = `3-Day Conference Starting at ${timeString}`;
    }
}

// Initialize time display
updateConferenceTime(); 