import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { sleep } from '../../../src/lib/utils/sleep';

describe('sleep', () => {
	beforeEach(() => {
		// Tell vitest to use mocked timers
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Restore real timers after each test
		vi.useRealTimers();
	});

	test('should resolve after the specified milliseconds', async () => {
		const ms = 1000;
		const sleepPromise = sleep(ms);

		// Fast-forward time by the specified duration
		await vi.advanceTimersByTimeAsync(ms);

		// The promise should now be resolved
		await expect(sleepPromise).resolves.toBeUndefined();
	});

	test('should not resolve before the specified time has passed', async () => {
		const ms = 2000;
		const onResolve = vi.fn();
		sleep(ms).then(onResolve);

		// Advance time by less than the sleep duration
		await vi.advanceTimersByTimeAsync(ms - 1);

		// The callback should not have been called yet
		expect(onResolve).not.toHaveBeenCalled();

		// Advance time by the remaining amount to trigger the resolution
		await vi.advanceTimersByTimeAsync(1);
		expect(onResolve).toHaveBeenCalledTimes(1);
	});

	test('should resolve immediately when ms is 0', async () => {
		const sleepPromise = sleep(0);

		// Run all pending timers
		await vi.runAllTimersAsync();

		await expect(sleepPromise).resolves.toBeUndefined();
	});
});