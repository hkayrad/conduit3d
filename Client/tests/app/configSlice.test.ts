import { describe, it, expect } from 'vitest';
import reducer, { setConfig, updateConfig, selectConfig } from '../../src/app/configSlice';

describe('configSlice', () => {
    const initialState = {
        ARMATUR_COLOR: "#ff0000ff",
    };

    it('should return the initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setConfig', () => {
        const newConfig = { THEME: "dark" };
        const actual = reducer(initialState, setConfig(newConfig));
        expect(actual).toEqual(newConfig);
    });

    it('should handle updateConfig', () => {
        const update = { NEW_SETTING: "enabled" };
        const expected = { ...initialState, ...update };
        const actual = reducer(initialState, updateConfig(update));
        expect(actual).toEqual(expected);
    });

    it('should handle updateConfig with overwrite', () => {
        const update = { ARMATUR_COLOR: "#00ff00ff" };
        const actual = reducer(initialState, updateConfig(update));
        expect(actual).toEqual(update);
    });

    it('should select config from state', () => {
        const state = { config: initialState };
        expect(selectConfig(state)).toEqual(initialState);
    });
});
