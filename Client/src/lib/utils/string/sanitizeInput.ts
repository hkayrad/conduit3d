export const ValidationPatterns = {
    // Basic text sanitization - allows letters, numbers, spaces, basic punctuation
    SAFE_TEXT: /^[a-zA-Z0-9\s.,\-_!?()]+$/,

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

    // Numbers only
    NUMBERS_ONLY: /^\d+$/,

    // Decimal numbers
    DECIMAL: /^\d+(\.\d*)?$|^\d*\.\d+$/,

    // Search query sanitization (for your global search)
    SEARCH_QUERY: /^[a-zA-Z0-9\s.,\-_]+$/,

    // File name sanitization
    FILENAME: /^[a-zA-Z0-9\-_.\s]+$/,

    // Remove special characters but keep Turkish characters
    TURKISH_TEXT: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s.,\-_!?()]+$/,
} as const;

/**
 * Sanitization functions
 */
export class InputSanitizer {
    /**
     * Remove HTML tags from input
     */
    static removeHtml(input: string): string {
        return input.replaceAll(ValidationPatterns.HTML_TAGS, '');
    }

    /**
     * Remove script tags and content
     */
    static removeScripts(input: string): string {
        return input.replaceAll(ValidationPatterns.SCRIPT_TAGS, '');
    }

    /**
     * Basic XSS prevention
     */
    static preventXSS(input: string): string {
        return input
            .replaceAll("<", '&lt;')
            .replaceAll(">", '&gt;')
            .replaceAll("\"", '&quot;')
            .replaceAll("'", '&#x27;')
            .replaceAll("/", '&#x2F;');
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
            sanitized = sanitized.replaceAll(allowTurkish ? /[^a-zA-ZçğıöşüÇĞIİÖŞÜ0-9\s.,\-_!?()]/ : /[^a-zA-Z0-9\s.,\-_!?()]/, '');
        }

        return sanitized.trim();
    }
}