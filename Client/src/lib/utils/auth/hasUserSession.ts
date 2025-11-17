/**
 * Checks if the user has an active session.
 * @returns True if the user has a session, false otherwise.
 */
export function hasUserSession(): boolean {
	// Check for user session cookie
	return document.cookie.includes("user_session=");
}
