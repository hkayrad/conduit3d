import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// We will dynamically import Logger in each test suite
// to re-evaluate the `isDebug` flag based on our mocked environment.
let Logger: typeof import('../../../src/lib/utils/logger').Logger;

const consoleSpies = {
    error: vi.spyOn(console, 'error').mockImplementation(() => { }),
    table: vi.spyOn(console, 'table').mockImplementation(() => { }),
    groupCollapsed: vi.spyOn(console, 'groupCollapsed').mockImplementation(() => { }),
    trace: vi.spyOn(console, 'trace').mockImplementation(() => { }),
    groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => { })
};

describe('Logger', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('in development mode', () => {
        beforeEach(async () => {
            vi.stubEnv('VITE_USER_NODE_ENV', 'development');
            // Reset modules to force re-import with the new environment variable
            vi.resetModules();
            Logger = (await import('../../../src/lib/utils/logger')).Logger;
        });

        test('isDebug should be true', () => {
            expect(Logger.isDebug).toBe(true);
        });

        test('debug() should call console.groupCollapsed, trace, and groupEnd', () => {
            Logger.debug('Test debug', { data: 1 });
            expect(consoleSpies.groupCollapsed).toHaveBeenCalledWith('%c[DEBUG]: ', 'color: #34ce81;', 'Test debug', {
                data: 1
            });
            expect(consoleSpies.trace).toHaveBeenCalledOnce();
            expect(consoleSpies.groupEnd).toHaveBeenCalledOnce();
        });

        test('error() should call console.error', () => {
            Logger.error('Test error', 'details');
            expect(consoleSpies.error).toHaveBeenCalledWith('%c[ERROR]: ', 'color: #ff4d4f;', 'Test error', 'details');
        });

        test('warn() should call console.groupCollapsed, trace, and groupEnd', () => {
            Logger.warn('Test warn');
            expect(consoleSpies.groupCollapsed).toHaveBeenCalledWith('%c[WARN]: ', 'color: #ff7300;', 'Test warn');
            expect(consoleSpies.trace).toHaveBeenCalledOnce();
            expect(consoleSpies.groupEnd).toHaveBeenCalledOnce();
        });

        test('table() should call console.table', () => {
            const data = [{ id: 1, name: 'test' }];
            Logger.table(data);
            expect(consoleSpies.table).toHaveBeenCalledWith(data, undefined);
        });
    });

    describe('in production mode', () => {
        beforeEach(async () => {
            vi.stubEnv('VITE_USER_NODE_ENV', 'production');
            vi.resetModules();
            Logger = (await import('../../../src/lib/utils/logger')).Logger;
        });

        test('isDebug should be false', () => {
            expect(Logger.isDebug).toBe(false);
        });

        test('debug() should not call any console methods', () => {
            Logger.debug('Should not log');
            for (const spy of Object.values(consoleSpies)) {
                expect(spy).not.toHaveBeenCalled();
            }
        });

        test('error() should not call any console methods', () => {
            Logger.error('Should not log');
            expect(consoleSpies.error).not.toHaveBeenCalled();
        });

        test('warn() should not call any console methods', () => {
            Logger.warn('Should not log');
            for (const spy of Object.values(consoleSpies)) {
                expect(spy).not.toHaveBeenCalled();
            }
        });

        test('table() should not call any console methods', () => {
            Logger.table([{ id: 1 }]);
            expect(consoleSpies.table).not.toHaveBeenCalled();
        });
    });
});