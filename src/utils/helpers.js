// Helper Utilities
// Common utility functions

const crypto = require('crypto');

const helpers = {
    // Generate random string
    generateRandomString: (length = 10) => {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    },

    // Generate UUID
    generateUUID: () => {
        return crypto.randomUUID();
    },

    // Capitalize first letter
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Format name (capitalize each word)
    formatName: (name) => {
        return name.split(' ').map(helpers.capitalize).join(' ');
    },

    // Format phone number
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    },

    // Calculate age from birth date
    calculateAge: (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },

    // Format date to readable string
    formatDate: (date, format = 'YYYY-MM-DD') => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            default:
                return d.toLocaleDateString();
        }
    },

    // Format time duration (seconds to HH:MM:SS)
    formatDuration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Calculate quiz score percentage
    calculatePercentage: (obtained, total) => {
        if (total === 0) return 0;
        return Math.round((obtained / total) * 100);
    },

    // Generate grade from percentage
    getGradeFromPercentage: (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    },

    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Remove null/undefined values from object
    cleanObject: (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== null && obj[key] !== undefined) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    },

    // Convert string to slug
    createSlug: (str) => {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Truncate text
    truncateText: (text, maxLength, suffix = '...') => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - suffix.length) + suffix;
    },

    // Check if value is empty
    isEmpty: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    // Generate random number in range
    randomNumber: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Shuffle array
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Sort array of objects by property
    sortByProperty: (array, property, ascending = true) => {
        return array.sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (ascending) {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    }
};

module.exports = helpers;