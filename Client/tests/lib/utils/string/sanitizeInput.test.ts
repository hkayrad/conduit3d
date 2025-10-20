import { test, expect, describe } from 'vitest';
import { InputSanitizer } from "../../../../src/lib/utils/string/sanitizeInput";

describe('InputSanitizer', () => {
    describe('removeHtml', () => {
        test('should remove simple HTML tags', () => {
            const input = '<b>Bold Text</b> and <i>Italic Text</i>';
            const sanitized = InputSanitizer.removeHtml(input);
            expect(sanitized).toBe('Bold Text and Italic Text');
        });

        test('should handle nested HTML tags', () => {
            const input = '<div><p><span>Hello</span></p></div>';
            const sanitized = InputSanitizer.removeHtml(input);
            expect(sanitized).toBe('Hello');
        });

        test('should handle self-closing tags', () => {
            const input = 'Hello<br/>World';
            const sanitized = InputSanitizer.removeHtml(input);
            expect(sanitized).toBe('HelloWorld');
        });
    });

    describe('removeScripts', () => {
        test('should remove script tags and their content', () => {
            const input = '<script>alert("XSS")</script>Hello World';
            const sanitized = InputSanitizer.removeScripts(input);
            expect(sanitized).toBe('Hello World');
        });

        test('should remove script tags with attributes', () => {
            const input = '<script type="text/javascript">console.log("test");</script>';
            const sanitized = InputSanitizer.removeScripts(input);
            expect(sanitized).toBe('');
        });
    });

    describe('preventXSS', () => {
        test('should escape characters to prevent XSS', () => {
            const input = '<img src="x" onerror="alert(\'XSS\')">';
            const sanitized = InputSanitizer.preventXSS(input);
            expect(sanitized).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(&#x27;XSS&#x27;)&quot;&gt;');
        });
    });

    describe('preventSQLInjection', () => {
        test('should remove characters used in SQL injection', () => {
            const input = "SELECT * FROM users WHERE name = 'admin'; --";
            const sanitized = InputSanitizer.preventSQLInjection(input);
            expect(sanitized).toBe('SELECT * FROM users WHERE name = admin --');
        });
    });

    describe('sanitizeText', () => {
        test('should remove script tags', () => {
            const input = '<script>alert("XSS")</script>Hello World';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('alert(quotXSSquot)Hello World');
        });

        test('should remove HTML tags', () => {
            const input = '<b>Bold Text</b> and <i>Italic Text</i>';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('Bold Text and Italic Text');
        });

        test('should prevent SQL injection patterns', () => {
            const input = "Hello'; DROP TABLE users; --";
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('Hello DROP TABLE users --');
        });

        test('should prevent XSS attacks by removing tags', () => {
            const input = '<img src=x onerror=alert("XSS") />';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('');
        });

        test('should allow Turkish characters when specified', () => {
            const input = 'Merhaba Dünya! Çalışıyor mu?';
            const sanitized = InputSanitizer.sanitizeText(input, true);
            expect(sanitized).toBe('Merhaba Dünya! Çalışıyor mu?');
        });

        test('should remove Turkish characters when not allowed', () => {
            const input = 'Merhaba Dünya! Çalışıyor mu?';
            const sanitized = InputSanitizer.sanitizeText(input, false);
            expect(sanitized).toBe('Merhaba Dnya! alyor mu?');
        });

        test('should remove disallowed characters', () => {
            const input = 'Hello @World #2024!';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('Hello World 2024!');
        });

        test('should handle empty string input', () => {
            const input = '';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('');
        });

        test('should trim whitespace from the result', () => {
            const input = '  leading and trailing spaces  ';
            const sanitized = InputSanitizer.sanitizeText(input);
            expect(sanitized).toBe('leading and trailing spaces');
        });
    });

    describe('sanitizeSearchQuery', () => {
        test('should remove dangerous tags and patterns', () => {
            const input = '<script>alert("XSS")</script> SELECT * FROM users; DROP TABLE users; --';
            const sanitized = InputSanitizer.sanitizeSearchQuery(input);
            expect(sanitized).toBe('alert("XSS") SELECT * FROM users DROP TABLE users --');
        });

        test('should trim and limit length of search query', () => {
            const input = "A".repeat(150);
            const sanitized = InputSanitizer.sanitizeSearchQuery(input);
            expect(sanitized.length).toBe(100);
            expect(sanitized).toBe('A'.repeat(100));
        });

        test('should handle empty string input', () => {
            const input = '';
            const sanitized = InputSanitizer.sanitizeSearchQuery(input);
            expect(sanitized).toBe('');
        });

        test('should trim whitespace', () => {
            const input = '  search term  ';
            const sanitized = InputSanitizer.sanitizeSearchQuery(input);
            expect(sanitized).toBe('search term');
        });

        test('should not exceed max length after trimming', () => {
            const input = ' '.repeat(10) + 'A'.repeat(100);
            const sanitized = InputSanitizer.sanitizeSearchQuery(input);
            expect(sanitized).toBe('A'.repeat(100));
        });
    });
});