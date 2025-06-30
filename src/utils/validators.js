
const validators = {

    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },


    isValidPassword: (password) => {

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    },


    isValidPhone: (phone) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },


    isValidStudentId: (studentId) => {

        const studentIdRegex = /^[A-Za-z0-9]{6,12}$/;
        return studentIdRegex.test(studentId);
    },


    isValidSubjectCode: (code) => {

        const codeRegex = /^[A-Z]{2,4}[-]?[0-9]{2,4}$/;
        return codeRegex.test(code);
    },


    isValidURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },


    isValidDate: (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
    },


    isValidTime: (timeString) => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    },


    isValidNumber: (value, min = null, max = null) => {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    },


    isValidInteger: (value, min = null, max = null) => {
        const num = parseInt(value);
        if (isNaN(num) || num !== parseFloat(value)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    },


    isValidArray: (value, minLength = 0, maxLength = null) => {
        if (!Array.isArray(value)) return false;
        if (value.length < minLength) return false;
        if (maxLength !== null && value.length > maxLength) return false;
        return true;
    },


    isValidLength: (str, min = 0, max = null) => {
        if (typeof str !== 'string') return false;
        if (str.length < min) return false;
        if (max !== null && str.length > max) return false;
        return true;
    },


    isValidFileExtension: (filename, allowedExtensions) => {
        const extension = filename.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
    },


    isValidMimeType: (mimetype, allowedTypes) => {
        return allowedTypes.includes(mimetype);
    },


    sanitizeString: (str) => {
        return str.replace(/[<>\"']/g, '');
    },


    normalizeEmail: (email) => {
        return email.toLowerCase().trim();
    },


    isValidGrade: (grade) => {
        return validators.isValidNumber(grade, 0, 100);
    },


    isValidSemester: (semester) => {
        const validSemesters = ['spring', 'summer', 'fall', 'winter'];
        return validSemesters.includes(semester.toLowerCase());
    },

    
    isValidAcademicYear: (year) => {
        const yearRegex = /^\d{4}-\d{4}$/;
        if (!yearRegex.test(year)) return false;
        
        const [startYear, endYear] = year.split('-').map(Number);
        return endYear === startYear + 1;
    }
};

module.exports = validators; 