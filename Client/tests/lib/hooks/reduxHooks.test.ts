import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as ReactRedux from 'react-redux';

// Mock the react-redux module
vi.mock('react-redux', () => {
    const mockDispatch = vi.fn();
    const mockUseSelector = vi.fn((selector: any) => selector());

    const useDispatchMock = vi.fn(() => mockDispatch);
    (useDispatchMock as any).withTypes = () => useDispatchMock;

    const useSelectorMock = vi.fn(mockUseSelector);
    (useSelectorMock as any).withTypes = () => useSelectorMock;  // Changed from useDispatchMock to useSelectorMock

    return {
        useDispatch: useDispatchMock,
        useSelector: useSelectorMock,
    };
});

import { useAppDispatch, useAppSelector } from '../../../src/lib/hooks/reduxHooks';

describe('reduxHooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('useAppDispatch should return the dispatch function', () => {
        const { result } = renderHook(() => useAppDispatch());

        expect(result.current).toBeInstanceOf(Function);
        expect(ReactRedux.useDispatch).toHaveBeenCalled();
    });

    it('useAppSelector should call the selector and return state', () => {
        const mockState = { someValue: 'test' };
        const selector = vi.fn(() => mockState);

        const { result } = renderHook(() => useAppSelector(selector));

        expect(ReactRedux.useSelector).toHaveBeenCalled();
        expect(result.current).toEqual(mockState);
    });
});