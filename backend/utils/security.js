/**
 * Security utilities for input sanitization and validation
 */

/**
 * Basic HTML escape function to prevent XSS
 * Replaces characters that have special meaning in HTML
 *
 * @param {string} unsafe - The unsafe string
 * @returns {string} The escaped string
 */
const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

module.exports = {
    escapeHtml
};
