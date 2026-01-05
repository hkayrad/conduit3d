import { describe, it, expect, vi } from 'vitest';
import { ArmaturApi } from '../../../src/lib/api/armatur';
import instance from '../../../src/lib/instance';

// Mock axios instance
vi.mock('../../../src/lib/instance', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('ArmaturApi', () => {
    it('fetchAll calls get with correct params', async () => {
        const mockData = [{ id: 1, name: 'Test' }];
        (instance.get as any).mockResolvedValue({ data: { data: mockData } });

        const result = await ArmaturApi.fetchAll(10, 1);
        expect(instance.get).toHaveBeenCalledWith('armatur', expect.objectContaining({
            params: expect.objectContaining({ pageSize: 10, pageNumber: 1 })
        }));
        expect(result).toEqual({ data: mockData });
    });

    it('create calls post with correct data', async () => {
        const payload = { adi: 'New Armatur' };
        (instance.post as any).mockResolvedValue({ data: { id: 1, ...payload } });

        const result = await ArmaturApi.create(payload);
        expect(instance.post).toHaveBeenCalledWith('armatur', payload);
        expect(result).toEqual({ id: 1, ...payload });
    });

    it('delete calls delete with correct ID', async () => {
        (instance.delete as any).mockResolvedValue({ data: { isSuccess: true } });

        const result = await ArmaturApi.delete(123);
        expect(instance.delete).toHaveBeenCalledWith('armatur/123');
        expect(result).toBe(true);
    });

    it('fetchTypes calls get', async () => {
        (instance.get as any).mockResolvedValue({ data: { data: ['Type1', 'Type2'] } });
        const result = await ArmaturApi.fetchTypes();
        expect(instance.get).toHaveBeenCalledWith('armatur/types');
        expect(result).toEqual({ data: ['Type1', 'Type2'] });
    });

    it('fetchCount calls get with correct params', async () => {
        (instance.get as any).mockResolvedValue({ data: { data: 5 } });
        await ArmaturApi.fetchCount('test');
        expect(instance.get).toHaveBeenCalledWith('armatur/count', expect.objectContaining({
            params: expect.objectContaining({ query: 'test' })
        }));
    });
});
