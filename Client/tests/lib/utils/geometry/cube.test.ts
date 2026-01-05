import { describe, it, expect } from 'vitest';
import { CUBE_MESH, OFFSET_CUBE_MESH } from '../../../../src/lib/utils/geometry/cube';

describe('cube geometry utils', () => {
    describe('CUBE_MESH', () => {
        it('should have correct header', () => {
            expect(CUBE_MESH.header.vertexCount).toBe(24);
        });

        it('should have correct mode', () => {
            expect(CUBE_MESH.mode).toBe(4); // TRIANGLES
        });

        it('should have valid position attributes', () => {
            const positions = CUBE_MESH.attributes.POSITION.value;
            expect(positions).toBeInstanceOf(Float32Array);
            // 24 vertices * 3 coordinates = 72
            expect(positions.length).toBe(24 * 3);
        });

        it('should have valid normal attributes', () => {
            const normals = CUBE_MESH.attributes.NORMAL.value;
            expect(normals).toBeInstanceOf(Float32Array);
            // 24 vertices * 3 coordinates = 72
            expect(normals.length).toBe(24 * 3);
        });

        it('should have valid indices', () => {
            const indices = CUBE_MESH.indices.value;
            expect(indices).toBeInstanceOf(Uint16Array);
            // 6 faces * 2 triangles * 3 vertices = 36 indices
            expect(indices.length).toBe(36);
        });
    });

    describe('OFFSET_CUBE_MESH', () => {
        it('should have correct header', () => {
            expect(OFFSET_CUBE_MESH.header.vertexCount).toBe(24);
        });

        it('should have correct mode', () => {
            expect(OFFSET_CUBE_MESH.mode).toBe(4); // TRIANGLES
        });

        it('should have valid position attributes', () => {
            const positions = OFFSET_CUBE_MESH.attributes.POSITION.value;
            expect(positions).toBeInstanceOf(Float32Array);
            expect(positions.length).toBe(24 * 3);
        });

        it('should have valid normal attributes', () => {
            const normals = OFFSET_CUBE_MESH.attributes.NORMAL.value;
            expect(normals).toBeInstanceOf(Float32Array);
            expect(normals.length).toBe(24 * 3);
        });

        it('should have valid indices', () => {
            const indices = OFFSET_CUBE_MESH.indices.value;
            expect(indices).toBeInstanceOf(Uint16Array);
            expect(indices.length).toBe(36);
        });
    });
});
