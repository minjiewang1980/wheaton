// Registration management system
class RegistrationManager {
    constructor() {
        this.storageKey = 'conferenceRegistrations';
        this.init();
    }

    init() {
        this.loadRegistrations();
        this.updateStats();
        this.displayRegistrations();
    }

    // Load registrations from localStorage
    loadRegistrations() {
        const stored = localStorage.getItem(this.storageKey);
        this.registrations = stored ? JSON.parse(stored) : [];
        return this.registrations;
    }

    // Save registrations to localStorage
    saveRegistrations() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.registrations));
    }

    // Add a new registration
    addRegistration(registrationData) {
        const registration = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...registrationData
        };
        this.registrations.push(registration);
        this.saveRegistrations();
        return registration;
    }

    // Get all registrations
    getAllRegistrations() {
        return this.registrations;
    }

    // Clear all registrations
    clearAllRegistrations() {
        this.registrations = [];
        this.saveRegistrations();
    }

    // Calculate statistics
    calculateStats() {
        const stats = {
            total: this.registrations.length,
            adults: 0,
            youth: 0,
            children: 0,
            totalRevenue: 0,
            roomDays: 0,
            totalMeals: 0
        };

        this.registrations.forEach(reg => {
            // Count by age category
            if (reg.participantAge >= 18) {
                stats.adults++;
                stats.totalRevenue += 50;
            } else if (reg.participantAge >= 3) {
                stats.youth++;
                stats.totalRevenue += 25;
            } else {
                stats.children++;
            }

            // Count room days and meals
            stats.roomDays += reg.selectedDays ? reg.selectedDays.length : 0;
            
            if (reg.meals) {
                Object.values(reg.meals).forEach(dayMeals => {
                    Object.values(dayMeals).forEach(meal => {
                        if (meal) stats.totalMeals++;
                    });
                });
            }
        });

        return stats;
    }

    // Update statistics display
    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('totalRegistrations').textContent = stats.total;
        document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue}`;
        document.getElementById('adultCount').textContent = stats.adults;
        document.getElementById('youthCount').textContent = stats.youth;
        document.getElementById('childCount').textContent = stats.children;
    }

    // Display registrations in table
    displayRegistrations() {
        const container = document.getElementById('registrationsContent');
        
        if (this.registrations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #d1d5db; margin-bottom: 15px;"></i>
                    <p>No registrations found. Start by registering participants!</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 15px; text-decoration: none;">
                        <i class="fas fa-plus"></i> Add Registration
                    </a>
                </div>
            `;
            return;
        }

        let tableHTML = `
            <table class="registrations-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Category</th>
                        <th>Fee</th>
                        <th>Room Days</th>
                        <th>Meals</th>
                        <th>Registration Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.registrations.forEach(reg => {
            const regDate = new Date(reg.timestamp).toLocaleDateString();
            const regTime = new Date(reg.timestamp).toLocaleTimeString();
            
            // Calculate meal count
            let mealCount = 0;
            if (reg.meals) {
                Object.values(reg.meals).forEach(dayMeals => {
                    Object.values(dayMeals).forEach(meal => {
                        if (meal) mealCount++;
                    });
                });
            }

            // Determine fee badge class
            let feeClass = 'fee-adult';
            let feeText = '$50';
            if (reg.participantAge < 3) {
                feeClass = 'fee-child';
                feeText = 'FREE';
            } else if (reg.participantAge < 18) {
                feeClass = 'fee-youth';
                feeText = '$25';
            }

            tableHTML += `
                <tr>
                    <td>#${reg.id}</td>
                    <td><strong>${reg.participantName}</strong></td>
                    <td>${reg.participantEmail}</td>
                    <td>${reg.participantAge}</td>
                    <td>${reg.ageCategory}</td>
                    <td><span class="fee-badge ${feeClass}">${feeText}</span></td>
                    <td>${reg.selectedDays ? reg.selectedDays.length : 0} days</td>
                    <td>${mealCount} meals</td>
                    <td>
                        <div>${regDate}</div>
                        <div style="font-size: 0.8em; color: #6b7280;">${regTime}</div>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    // Export to CSV
    exportToCSV() {
        if (this.registrations.length === 0) {
            alert('No registrations to export!');
            return;
        }

        const headers = [
            'ID', 'Name', 'Email', 'Age', 'Category', 'Registration Fee', 
            'Room Days', 'Selected Days', 'Total Meals', 'Meal Details', 
            'Registration Date', 'Registration Time'
        ];

        let csvContent = headers.join(',') + '\n';

        this.registrations.forEach(reg => {
            const regDate = new Date(reg.timestamp).toLocaleDateString();
            const regTime = new Date(reg.timestamp).toLocaleTimeString();
            
            // Calculate meals
            let mealCount = 0;
            let mealDetails = [];
            if (reg.meals) {
                Object.entries(reg.meals).forEach(([day, dayMeals]) => {
                    const dayNum = day.replace('day', '');
                    Object.entries(dayMeals).forEach(([meal, selected]) => {
                        if (selected) {
                            mealCount++;
                            mealDetails.push(`Day${dayNum}:${meal}`);
                        }
                    });
                });
            }

            const selectedDays = reg.selectedDays ? reg.selectedDays.join(';') : '';
            const mealDetailsStr = mealDetails.join(';');
            
            const row = [
                reg.id,
                `"${reg.participantName}"`,
                `"${reg.participantEmail}"`,
                reg.participantAge,
                `"${reg.ageCategory}"`,
                reg.registrationFee,
                reg.selectedDays ? reg.selectedDays.length : 0,
                `"${selectedDays}"`,
                mealCount,
                `"${mealDetailsStr}"`,
                `"${regDate}"`,
                `"${regTime}"`
            ];

            csvContent += row.join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conference-registrations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Export to JSON
    exportToJSON() {
        if (this.registrations.length === 0) {
            alert('No registrations to export!');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalRegistrations: this.registrations.length,
            statistics: this.calculateStats(),
            registrations: this.registrations
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conference-registrations-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the registration manager
const registrationManager = new RegistrationManager();

// Global functions for button clicks
function refreshData() {
    registrationManager.init();
    showNotification('Data refreshed successfully!', 'success');
}

function exportToCSV() {
    registrationManager.exportToCSV();
    showNotification('CSV export started!', 'success');
}

function exportToJSON() {
    registrationManager.exportToJSON();
    showNotification('JSON export started!', 'success');
}

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL registration data? This cannot be undone!')) {
        registrationManager.clearAllRegistrations();
        registrationManager.init();
        showNotification('All registration data has been cleared!', 'warning');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Auto-refresh data every 30 seconds
setInterval(() => {
    registrationManager.loadRegistrations();
    registrationManager.updateStats();
    registrationManager.displayRegistrations();
}, 30000); 