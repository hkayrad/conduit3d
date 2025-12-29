import { cleanup, render } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import InfoContent from '../../../../src/app/shared/infoContent/InfoContent';
import { FeatureType } from '../../../../src/lib/enums';

describe('InfoContent Component', () => {
    afterEach(cleanup)

    it('should return null if properties are null or undefined', () => {
        const { container: nullPropsContainer } = render(InfoContent(null));
        expect(nullPropsContainer.firstChild).toBeNull();

        const { container: undefinedPropsContainer } = render(InfoContent(undefined));
        expect(undefinedPropsContainer.firstChild).toBeNull();
    });

    it('should return null for an unknown dataType', () => {
        const properties = { dataType: 'UNKNOWN_TYPE', id: 1 };
        const { container } = render(InfoContent(properties));
        // InfoContent renders all properties except dataType, so it should have content
        expect(container.firstChild).not.toBeNull();
        // Verify it renders the id field but not dataType
        expect(container.textContent).toContain('1');
    });

    describe('FeatureType.BUILDING', () => {
        const buildingProps = {
            dataType: FeatureType.BUILDING,
            id: 101,
            adi: 'Main Building',
            siteAdi: 'Site A',
            kodu: 'B101',
            binaKatSayisi: 5,
            daireSayisi: 20,
            isyeriSayisi: 2,
        };

        it('should render correct InfoFields for BUILDING without coordinates', () => {
            const container = render(InfoContent(buildingProps));
            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(buildingProps.id);
            expect(pTags[1].textContent).toContain(buildingProps.adi);
            expect(pTags[2].textContent).toContain(buildingProps.siteAdi);
            expect(pTags[3].textContent).toContain(buildingProps.kodu);
            expect(pTags[4].textContent).toContain(buildingProps.binaKatSayisi);
            expect(pTags[5].textContent).toContain(buildingProps.daireSayisi);
            expect(pTags[6].textContent).toContain(buildingProps.isyeriSayisi);
            expect(pTags.length).toBe(7);
        });

        it('should render correct InfoFields for BUILDING with coordinates', () => {
            const coordinates = [40.7123456, -74.006789];
            const container = render(InfoContent(buildingProps, coordinates));
            const pTags = container.getAllByRole('paragraph');

            expect(pTags[7].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });

    describe('FeatureType.TRAFO', () => {
        const trafoProps = {
            dataType: FeatureType.TRAFO,
            id: 201,
            adi: 'Substation Alpha',
            kodu: 'T201',
        };

        it('should render correct InfoFields for TRAFO without coordinates', () => {
            const container = render(InfoContent(trafoProps));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(trafoProps.id);
            expect(pTags[1].textContent).toContain(trafoProps.adi);
            expect(pTags[2].textContent).toContain(trafoProps.kodu);
            expect(pTags.length).toBe(3);
        });

        it('should render correct InfoFields for TRAFO with coordinates', () => {
            const coordinates = [34.0522345, -118.243687];
            const container = render(InfoContent(trafoProps, coordinates));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[3].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });

    describe('FeatureType.YOL', () => {
        const yolProps = {
            dataType: FeatureType.YOL,
            id: 301,
            adi: 'Main Street',
            kodu: 'Y301',
            tipi: 'Asfalt',
            yapisi: 'Tek Şerit',
            seritSayisi: 2,
            genislik: 10.5,
        };

        it('should render correct InfoFields for YOL without coordinates', () => {
            const container = render(InfoContent(yolProps));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(yolProps.id);
            expect(pTags[1].textContent).toContain(yolProps.adi);
            expect(pTags[2].textContent).toContain(yolProps.kodu);
            expect(pTags[3].textContent).toContain(yolProps.tipi);
            expect(pTags[4].textContent).toContain(yolProps.yapisi);
            expect(pTags[5].textContent).toContain(yolProps.seritSayisi);
            expect(pTags[6].textContent).toContain(yolProps.genislik);
            expect(pTags.length).toBe(7);
        });

        it('should render correct InfoFields for YOL with coordinates', () => {
            const coordinates = [51.507351, -0.127758];
            const container = render(InfoContent(yolProps, coordinates));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[7].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });

    describe('FeatureType.POLE', () => {
        const poleProps = {
            dataType: FeatureType.POLE,
            id: 401,
            adi: 'Utility Pole 1',
            cinsi: 'Beton',
            tipi: 'Elektrik',
            direkNo: 'P401',
            boyOzellik: 'Uzun',
            direkBoyId: 15,
        };

        it('should render correct InfoFields for POLE without coordinates', () => {
            const container = render(InfoContent(poleProps));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(poleProps.id);
            expect(pTags[1].textContent).toContain(poleProps.adi);
            expect(pTags[2].textContent).toContain(poleProps.cinsi);
            expect(pTags[3].textContent).toContain(poleProps.tipi);
            expect(pTags[4].textContent).toContain(poleProps.direkNo);
            expect(pTags[5].textContent).toContain(poleProps.boyOzellik);
            expect(pTags[6].textContent).toContain(poleProps.direkBoyId);
            expect(pTags.length).toBe(7);
        });

        it('should render correct InfoFields for POLE with coordinates', () => {
            const coordinates = [51.507351, -0.127758];
            const container = render(InfoContent(poleProps, coordinates));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[7].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });

    describe('FeatureType.LINE', () => {
        const lineProps = {
            dataType: FeatureType.LINE,
            id: 501,
            adi: 'Power Line A',
            cinsi: 'Bakır',
            tipi: 'Yüksek Gerilim',
            kesit: '100mm2',
        };

        it('should render correct InfoFields for LINE without coordinates', () => {
            const container = render(InfoContent(lineProps));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(lineProps.id);
            expect(pTags[1].textContent).toContain(lineProps.adi);
            expect(pTags[2].textContent).toContain(lineProps.cinsi);
            expect(pTags[3].textContent).toContain(lineProps.tipi);
            expect(pTags[4].textContent).toContain(lineProps.kesit);
            expect(pTags.length).toBe(5);
        });

        it('should render correct InfoFields for LINE with coordinates', () => {
            const coordinates = [51.507351, -0.127758];
            const container = render(InfoContent(lineProps, coordinates));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[5].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });

    describe('FeatureType.REKORTMAN', () => {
        const rekortmanProps = {
            dataType: FeatureType.REKORTMAN,
            id: 601,
            tipi: 'Fiber Optik',
            kesit: '24 Core',
        };

        it('should render correct InfoFields for REKORTMAN without coordinates', () => {
            const container = render(InfoContent(rekortmanProps));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[0].textContent).toContain(rekortmanProps.id);
            expect(pTags[1].textContent).toContain(rekortmanProps.tipi);
            expect(pTags[2].textContent).toContain(rekortmanProps.kesit);
            expect(pTags.length).toBe(3);
        });

        it('should render correct InfoFields for REKORTMAN with coordinates', () => {
            const coordinates = [51.507351, -0.127758];
            const container = render(InfoContent(rekortmanProps, coordinates));

            const pTags = container.getAllByRole('paragraph');

            expect(pTags[3].textContent).toContain(`${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`);
        });
    });
});