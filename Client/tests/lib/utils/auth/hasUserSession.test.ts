import { describe, expect, it, vi } from "vitest";
import { hasUserSession } from "../../../../src/lib/utils/auth";

describe("hasUserSession", () => {
	it("should return true if user_session cookie exists", () => {
        const spy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('user_session=some_value');
		expect(hasUserSession()).toBe(true);
        spy.mockRestore();
	});

	it("should return false if user_session cookie does not exist", () => {
        const spy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('');
		expect(hasUserSession()).toBe(false);
        spy.mockRestore();
	});

	it("should return false if other cookies exist but user_session does not", () => {
        const spy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('other_cookie=some_value; another_cookie=another_value');
		expect(hasUserSession()).toBe(false);
        spy.mockRestore();
	});

    it("should return true if user_session cookie exists among other cookies", () => {
        const spy = vi.spyOn(document, 'cookie', 'get').mockReturnValue('other_cookie=some_value; user_session=some_value; another_cookie=another_value');
        expect(hasUserSession()).toBe(true);
        spy.mockRestore();
    });
});
