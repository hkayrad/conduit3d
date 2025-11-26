# TODO
- [] raster veri acma
- [x] armaturleri goster, tablo gelicek
- [] openlayers kullanarak cizim
- [x] featurelari yerin altindan gormeye de izin ver
- [x] highlight on gotos

- [] ortalama enerji kaybi hesabi

5 -> AG
28 -> AYD


# NOTES

|feature|geojson|wkb|diff|diff%|%|
|-|-|-|-|-|-|
|adrbina|403kb|323kb|-80kb|-%19.86|%80.14|
|buildings|2358kb|2077kb|-281kb|-%11.92|%88.08|
|buildings_200k|65mb|56mb|-9mb|-%13.85|%86.15|
|aghat|861kb|655kb|-196kb|-%23.93|%76.07|
|oghat|136kb|105kb|-21kb|-%22.79|%77.21|
|rekortman|226kb|172kb|-54kb|-%23.89|%76.11|
|agdirek|70.9kb|57.3kb|-13.6kb|-%19.18|%80.82|
|ogdirek|22.1kb|17.8kb|-4.3kb|-%19.46|%80.54|
|ayddirek|57.8kb|47.1kb|-10.7kb|-%18.51|%81.49|

### Optimization Notes

 > ***DON'T CHECK THE PERFORMANCE WHILE THE NETWORK TAB IS OPEN IN THE DEV TOOLS, IT CAUSES MAJOR PERFORMANCE PROBLEMS WHILE LOADING TILES FROM THE SERVER***

 > [Performance optimizations for Deck.gl](https://deck.gl/docs/developer-guide/performance)

 - Layers are drawn according to the layer list. The first one will be under the others. BE AWARE.
 - Use data chunks when loading the data into the map. (max 200k data per layer). Iterate over the chunks to generate the layers for features.
    ```js
        const [data, setData] = useState(someData);

        const layers = data.map((dataChunk) => new Layer(data: dataChunk));
    ```
 - Use `useMemo` hook to avoid recalculation where applicable but **MUST NOT** use `useMemo` in the layer. Use `updateTrigger` instead.
 - Use `visible` prop to toggle visibility.
 - Most layers have *Scale prop. Try to use *Scale before using the accessor with updateTrigger for recalculation.
 - **MUST** avoid creating new arrays in the accessor fields. Use constant arrays that are defined outside of the layer.
 - Set `boxZoom`to false on MapLibre component to disable `Shift + Click` selection box.
 - Interleaved Binary Data's can be used to render poles to increase efficiency by doing every calculation on the GPU. (Cannot be used for buildings beacuse of their different shapes and varying point amounts.) (It can be used for lines if broken in to singular line segments before creating the lines.) (**MUST** find a way to bind the strings to the line, they cannot be sent to he ArrayBuffer [Can get them using the original list])
 - *Natively using the GPU currently does not work for creating extruded column layers.*
 - Divide the lines before using in a layer, it causes **MAJOR** performance problems.


### Possible Search Terms

Implement it using tsvector column for the best searchability.

 - Create the tsvector column using what you want to be searchable.
 - Create an index using GIN on the tsvector column to make the search operations faster.
 - To perform the search, first use to_tsquery function convert the query to a tsvector searchable format and then compare it to the tsvector column using @@ operator.
 
##### Buildings
 - id
 - geometry
 - site_adi
 - adi
 - bina_kat_sayisi

##### Trafo Bina 
 - id
 - geometry
 - adi
 - kodu

##### AG/OG Hatlar
 - id
 - geometry
 - cinsi
 - kesit
 - tipi

##### Rekortman
 - id
 - geometry
 - kesit
 - tipi

##### AG/OGMUS/AYD Direk
 - id
 - geometry
 - cinsi
 - tipi
 - direk_no
 - boy_ozellik

# DB Modifications

- Users
```sql
-- Create a custom function to encapsulate the tsvector logic
CREATE OR REPLACE FUNCTION generate_searchable_text(
    id_val INT, 
    is_active_val BOOLEAN, 
    username_val TEXT, 
    email_val TEXT, 
    created_at_val TIMESTAMP WITH TIME ZONE, 
    user_role_val TEXT, 
    name_val TEXT
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text)) || ' ' ||
    coalesce((case when is_active_val then 'active' else 'inactive' end), '') || ' ' ||
    coalesce(username_val, '') || ' ' || 
    regexp_replace(coalesce(email_val, ''), '[.@]', ' ', 'g') || ' ' || 
    regexp_replace(coalesce(cast(created_at_val as text), ''), '^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\.(\d{3})\s+([+-]\d{4})$', '\1 \2 \3 \4', 'g') || ' ' ||s
    coalesce(user_role_val, '') || ' ' ||
    coalesce(name_val, '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Use the custom function 
ALTER TABLE users ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text(id, is_active, username, email, created_at, user_role, name)
) STORED;
```
- AdrBina
```sql 
CREATE OR REPLACE FUNCTION generate_searchable_text_adr_bina(
    id_val INT, 
    kodu_val TEXT,
    site_adi_val TEXT,
    adi_val TEXT, 
    bina_kat_sayisi_val FLOAT8,
    daire_sayisi_val FLOAT8,
    isyeri_sayisi_val FLOAT8,
    yukseklik_val FLOAT8
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(site_adi_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
    coalesce(cast(bina_kat_sayisi_val as text), '') || ' ' ||
    coalesce(cast(daire_sayisi_val as text), '') || ' ' ||
    coalesce(cast(isyeri_sayisi_val as text), '') || ' ' ||
    coalesce(cast(yukseklik_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "ADR_BINA" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_adr_bina(id, kodu, site_adi, adi, bina_kat_sayisi, daire_sayisi, isyeri_sayisi, yukseklik)
) STORED;

-- Create GIN index for fast text search
CREATE INDEX idx_adr_bina_searchable_text ON "ADR_BINA"USING GIN(searchable_text);
```

- TrafoBina
```sql 
CREATE OR REPLACE FUNCTION generate_searchable_text_trafo_bina(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the trafo_bina table
ALTER TABLE "SBK_TRAFOBINATIP" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_trafo_bina(id, kodu, adi)
) STORED;

-- Create GIN index for fast text search
CREATE INDEX idx_trafo_bina_searchable_text ON "SBK_TRAFOBINATIP" USING GIN(searchable_text);
```

- AgHat
```sql 
CREATE OR REPLACE FUNCTION generate_searchable_text_ag_hat(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    kesit_val TEXT,
    tipi_val TEXT
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
    coalesce(cinsi_val, '') || ' ' ||
	coalesce(kesit_val, '') || ' ' ||
	coalesce(tipi_val, '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_AGHAT" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_ag_hat(id, kodu, adi, cinsi, kesit, tipi)
) STORED;

-- Create GIN index for fast text search
CREATE INDEX idx_ag_hat_searchable_text ON "SBK_AGHAT" USING GIN(searchable_text);
```

- OgHat
```sql
CREATE OR REPLACE FUNCTION generate_searchable_text_og_hat(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    kesit_val TEXT,
    tipi_val TEXT
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
    coalesce(cinsi_val, '') || ' ' ||
	coalesce(kesit_val, '') || ' ' ||
	coalesce(tipi_val, '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_OGHAT" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_og_hat(id, kodu, adi, cinsi, kesit, tipi)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_og_hat_searchablesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(cinsi_val, '') || ' ' ||
	coalesce(tipi_val, '') || ' ' ||
	coalesce(direk_no_val, '') || ' ' ||
	coalesce(boy_ozellik_val, '') || ' ' ||
	coalesce(cast(direk_boy_id_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_OGMUSDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_og_mus_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_ogmusdirek_searchable_text ON "SBK_OGMUSDIREK" USING GIN(searchable_text);
```

- AydDirek
```sql
CREATE OR REPLACE FUNCTION generate_searchable_text_ayd_direk(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    tipi_val TEXT,
    direk_no_val TEXT,
    boy_ozellik_val TEXT,
    direk_boy_id_val FLOAT8
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(cinsi_val, '') || ' ' ||
	coalesce(tipi_val, '') || ' ' ||
	coalesce(direk_no_val, '') || ' ' ||
	coalesce(boy_ozellik_val, '') || ' ' ||
	coalesce(cast(direk_boy_id_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_AYDDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_ayd_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_ayddirek_searchable_text ON "SBK_AYDDIREK" USING GIN(searchable_text);
```le_text ON "SBK_OGHAT" USING GIN(searchable_text);
```

- Rekortman
```sql
CREATE OR REPLACE FUNCTION generate_searchable_text_rekortman(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    kesit_val TEXT,
    tipi_val TEXT
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(kesit_val, '') || ' ' ||
	coalesce(tipi_val, '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_rEKORTMAN" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_rekortman(id, kodu, adi, kesit, tipi)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_rekortman_searchable_text ON "SBK_rEKORTMAN" USING GIN(searchable_text);
```

- AgDirek
```sql 
CREATE OR REPLACE FUNCTION generate_searchable_text_ag_direk(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    tipi_val TEXT,
    direk_no_val TEXT,
    boy_ozellik_val TEXT,
    direk_boy_id_val FLOAT8
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(cinsi_val, '') || ' ' ||
	coalesce(tipi_val, '') || ' ' ||
	coalesce(direk_no_val, '') || ' ' ||
	coalesce(boy_ozellik_val, '') || ' ' ||
	coalesce(cast(direk_boy_id_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_AGDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_ag_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_agdirek_searchable_text ON "SBK_AGDIREK" USING GIN(searchable_text);
```

- OgMusDirek 
```sql 
CREATE OR REPLACE FUNCTION generate_searchable_text_og_mus_direk(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    tipi_val TEXT,
    direk_no_val TEXT,
    boy_ozellik_val TEXT,
    direk_boy_id_val FLOAT8
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(cinsi_val, '') || ' ' ||
	coalesce(tipi_val, '') || ' ' ||
	coalesce(direk_no_val, '') || ' ' ||
	coalesce(boy_ozellik_val, '') || ' ' ||
	coalesce(cast(direk_boy_id_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_OGMUSDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_og_mus_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_ogmusdirek_searchable_text ON "SBK_OGMUSDIREK" USING GIN(searchable_text);
```

- AydDirek
```sql
CREATE OR REPLACE FUNCTION generate_searchable_text_ayd_direk(
    id_val INT, 
    kodu_val TEXT,
    adi_val TEXT, 
    cinsi_val TEXT,
    tipi_val TEXT,
    direk_no_val TEXT,
    boy_ozellik_val TEXT,
    direk_boy_id_val FLOAT8
)
RETURNS tsvector
AS $$
SELECT to_tsvector('simple', 
    coalesce(cast(id_val as text), '') || ' ' ||
    coalesce(kodu_val, '') || ' ' ||
    coalesce(adi_val, '') || ' ' ||
	coalesce(cinsi_val, '') || ' ' ||
	coalesce(tipi_val, '') || ' ' ||
	coalesce(direk_no_val, '') || ' ' ||
	coalesce(boy_ozellik_val, '') || ' ' ||
	coalesce(cast(direk_boy_id_val as text), '')
);
$$ LANGUAGE SQL IMMUTABLE;

-- Add the generated column to the adr_bina table
ALTER TABLE "SBK_AYDDIREK" ADD COLUMN searchable_text tsvector GENERATED ALWAYS AS (
    generate_searchable_text_ayd_direk(id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id)
) STORED;

-- Create GIN index for fast text search
create INDEX idx_ayddirek_searchable_text ON "SBK_AYDDIREK" USING GIN(searchable_text);
```
