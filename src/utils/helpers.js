const crypto = require('crypto');

const helpers = {
    generateRandomString: (length = 10) => {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    },

    generateUUID: () => {
        return crypto.randomUUID();
    },

    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    formatName: (name) => {
        return name.split(' ').map(helpers.capitalize).join(' ');
    },

    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    },

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

    formatDuration: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    calculatePercentage: (obtained, total) => {
        if (total === 0) return 0;
        return Math.round((obtained / total) * 100);
    },

    getGradeFromPercentage: (percentage) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    },

    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    cleanObject: (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== null && obj[key] !== undefined) {
                cleaned[key] = obj[key];
            }
        });
        return cleaned;
    },

    // createSlug: (str) => {
    //     return str
    //         .toLowerCase()
    //         .replace(/[^\w\s-]/g, '')
    //         .replace(/[\s_-]+/g, '-')
    //         .replace(/^-+|-+$/g, '');
    // },

    truncateText: (text, maxLength, suffix = '...') => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - suffix.length) + suffix;
    },

    isEmpty: (value) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    randomNumber: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

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