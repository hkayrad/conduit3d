export const ValidationPatterns = {
    // Basic text sanitization - allows letters, numbers, spaces, basic punctuation
    SAFE_TEXT: /^[a-zA-Z0-9\s\.,\-_!?()]+$/,

    // Alphanumeric only (no spaces)
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,

    // Alphanumeric with spaces
    ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,

    // Remove HTML tags
    HTML_TAGS: /<.*?>/g,

    // Remove script tags and content
    SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,

    // SQL injection patterns to detect
    SQL_INJECTION: /('|(\\-{2})|(;)|(\\|)|(\\*)|(\\x00)|(\\n)|(\\r)|(\\x1a))/gi,

    // XSS patterns to detect
    XSS_PATTERNS: /(javascript:|vbscript:|onload=|onerror=|onclick=|onmouseover=)/gi,

    // Email validation
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

    // URL validation
    URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.]*))?(?:\#(?:[\w.]*))?)?$/,

    // Coordinates (latitude/longitude)
    COORDINATES: /^-?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?),\s*-?((1[0-7]\d|[1-9]?\d)(?:\.\d+)?|180(?:\.0+)?)$/,

    // Numbers only
    NUMBERS_ONLY: /^[0-9]+$/,

    // Decimal numbers
    DECIMAL: /^\d+(\.\d*)?$|^\d*\.\d+$/,

    // Search query sanitization (for your global search)
    SEARCH_QUERY: /^[a-zA-Z0-9\s\.,\-_]+$/,

    // File name sanitization
    FILENAME: /^[a-zA-Z0-9\-_\.\s]+$/,

    // Remove special characters but keep Turkish characters
    TURKISH_TEXT: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s\.,\-_!?()]+$/,
} as const;

/**
 * Sanitization functions
 */
export class InputSanitizer {
    /**
     * Remove HTML tags from input
     */
    static removeHtml(input: string): string {
        return input.replace(ValidationPatterns.HTML_TAGS, '');
    }

    /**
     * Remove script tags and content
     */
    static removeScripts(input: string): string {
        return input.replace(ValidationPatterns.SCRIPT_TAGS, '');
    }

    /**
     * Basic XSS prevention
     */
    static preventXSS(input: string): string {
        return input
            .replaceAll(/</g, '&lt;')
            .replaceAll(/>/g, '&gt;')
            .replaceAll(/"/g, '&quot;')
            .replaceAll(/'/g, '&#x27;')
            .replaceAll(/\//g, '&#x2F;');
    }

    /**
     * SQL injection prevention (basic)
     */
    static preventSQLInjection(input: string): string {
        return input.replaceAll(ValidationPatterns.SQL_INJECTION, '');
    }

    /**
     * Sanitize search query for your global search component
     */
    static sanitizeSearchQuery(query: string): string {
        // Remove dangerous characters but keep useful search characters
        let sanitized = query
            .replaceAll(ValidationPatterns.HTML_TAGS, '')
            .replaceAll(ValidationPatterns.SCRIPT_TAGS, '')
            .replaceAll(ValidationPatterns.SQL_INJECTION, '')
            .replaceAll(ValidationPatterns.XSS_PATTERNS, '')
            .trim();

        // Limit length
        if (sanitized.length > 100) {
            sanitized = sanitized.substring(0, 100);
        }

        return sanitized;
    }

    /**
     * General text sanitization
     */
    static sanitizeText(input: string, allowTurkish: boolean = false): string {
        const pattern = allowTurkish ? ValidationPatterns.TURKISH_TEXT : ValidationPatterns.SAFE_TEXT;

        // First remove dangerous content
        let sanitized = this.removeHtml(input);
        sanitized = this.removeScripts(sanitized);

        // Then validate against allowed pattern
        if (!pattern.test(sanitized)) {
            // Remove non-matching characters
            sanitized = sanitized.replaceAll(allowTurkish ? /[^a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s\.,\-_!?()]/ : /[^a-zA-Z0-9\s\.,\-_!?()]/, '');
        }

        return sanitized.trim();
    }

    /**
     * Validate and sanitize coordinates
     */
    static sanitizeCoordinates(lat: string, lon: string): { lat: number | null, lon: number | null } {
        const coordString = `${lat},${lon}`;

        if (!ValidationPatterns.COORDINATES.test(coordString)) {
            return { lat: null, lon: null };
        }

        const latNum = Number.parseFloat(lat);
        const lonNum = Number.parseFloat(lon);

        if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
            return { lat: null, lon: null };
        }

        return { lat: latNum, lon: lonNum };
    }

    /**
     * Validate email
     */
    static isValidEmail(email: string): boolean {
        return ValidationPatterns.EMAIL.test(email);
    }

    /**
     * Validate URL
     */
    static isValidUrl(url: string): boolean {
        return ValidationPatterns.URL.test(url);
    }
}