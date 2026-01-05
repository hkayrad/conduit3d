import { describe, it, expect, vi } from 'vitest';
import { createVectorLayer, createBuildingLayer } from '../../../../src/lib/utils/ol/layer';

// Mock OpenLayers dependencies
vi.mock('ol/layer/Vector', () => ({
    default: class MockVectorLayer {
        source: any;
        style: any;
        properties: any = {};
        constructor(options: any) {
            this.source = options.source;
            this.style = options.style;
        }
        setProperties(props: any) {
            this.properties = { ...this.properties, ...props };
        }
        setStyle(style: any) {
            this.style = style;
        }
    }
}));

vi.mock('ol/source/Vector', () => ({
    default: class MockVectorSource {
        features: any;
        constructor(options: any) {
            this.features = options.features;
        }
    }
}));

vi.mock('ol/format/GeoJSON', () => ({
    default: class MockGeoJSON {
        readFeatures(data: any, options: any) {
            return [{ type: "MockFeature" }]; // Mock features 
        }
    }
}));

vi.mock('ol/style', () => ({
    Style: class MockStyle { options: any; constructor(opts: any) { this.options = opts; } },
    Stroke: class MockStroke { options: any; constructor(opts: any) { this.options = opts; } },
    Fill: class MockFill { options: any; constructor(opts: any) { this.options = opts; } },
    Circle: class MockCircle { options: any; constructor(opts: any) { this.options = opts; } },
}));

describe('ol layer utils', () => {
    describe('createVectorLayer', () => {
        it('should return null for invalid data', () => {
            expect(createVectorLayer(null, '#fff')).toBeNull();
        });

        it('should create a vector layer with correct properties for line/features', () => {
            const data = { type: 'FeatureCollection', features: [{ type: 'Feature' }] };
            const layer: any = createVectorLayer(data, '#ff0000', 2, false);

            expect(layer).toBeDefined();
            expect(layer.properties.isDataLayer).toBe(true);
            expect(layer.source).toBeDefined();

            // Verify style style for line
            expect(layer.style.options.stroke).toBeDefined();
            expect(layer.style.options.fill).toBeDefined();
            expect(layer.style.options.stroke.options.color).toBe('#ff0000');
            expect(layer.style.options.stroke.options.width).toBe(2);
        });

        it('should create a vector layer with correct properties for points', () => {
            const data = { type: 'FeatureCollection', features: [{ type: 'Feature' }] };
            const layer: any = createVectorLayer(data, '#ff0000', 2, true);

            expect(layer).toBeDefined();
            // Verify style for point (CircleStyle)
            expect(layer.style.options.image).toBeDefined();
            expect(layer.style.options.image.options.radius).toBe(5);
            expect(layer.style.options.image.options.fill.options.color).toBe('#ff0000');
        });
    });

    describe('createBuildingLayer', () => {
        it('should return null for invalid data', () => {
            expect(createBuildingLayer(null, '#fff')).toBeNull();
        });

        it('should create building layer with darkened fill color', () => {
            const data = { type: 'FeatureCollection', features: [{ type: 'Feature' }] };
            // Use a color easy to calculate darkness: #ffffff -> rgba(178, 178, 178, 0.3)
            // 0xff * 0.7 = 178.5 -> floor is 178
            const layer: any = createBuildingLayer(data, '#ffffff');

            expect(layer).toBeDefined();
            expect(layer.style.options.stroke.options.color).toBe('#ffffff');
            expect(layer.style.options.fill.options.color).toBe('rgba(178, 178, 178, 0.3)');
        });
    });
});
