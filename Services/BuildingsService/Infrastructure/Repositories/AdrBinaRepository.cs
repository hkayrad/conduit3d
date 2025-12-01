using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

/// <summary>
/// Repository for managing ADR_BINA entities.
/// </summary>
/// <param name="context">AdrBina context.</param>
/// <remarks>
/// This class implements the IAdrBinaRepository interface and provides methods for managing ADR_BINA entities.
/// </remarks>
public class AdrBinaRepository(BuildingsContext context) : IAdrBinaRepository
{
    /// <summary>
    /// Buildings context.
    /// </summary>
    private readonly BuildingsContext _context = context;

    /// <summary>
    /// ADR_BINA DbSet.
    /// </summary>
    private readonly DbSet<AdrBina> _dbSet = context.Set<AdrBina>();

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves all ADR_BINA entities with pagination and sorting using native SQL.
    /// </remarks>
    public async Task<List<AdrBina>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            string? query,
                                            CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson,
        var sqlQuery = _dbSet.FromSql($@"SELECT
                                        id,
                                        kodu,
                                        site_adi,
                                        adi,
                                        bina_kat_sayisi,
                                        daire_sayisi,
                                        isyeri_sayisi,
                                        yukseklik,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""ADR_BINA""
                                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope(
                                        {extent.MinX},
                                        {extent.MinY},
                                        {extent.MaxX},
                                        {extent.MaxY},
                                        4326
                                    )");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        if (ascending)
            sqlQuery = sqlQuery.OrderBy(x => EF.Property<object>(x, sortBy));
        else
            sqlQuery = sqlQuery.OrderByDescending(x => EF.Property<object>(x, sortBy));

        sqlQuery = sqlQuery.Skip((pageNumber - 1) * pageSize).Take(pageSize);

        return await sqlQuery.ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves a single ADR_BINA entity by its ID using native SQL.
    /// </remarks>
    public async Task<AdrBina?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson

        var sqlQuery = _dbSet.FromSql($@"SELECT
                                        id,
                                        kodu,
                                        site_adi,
                                        adi,
                                        bina_kat_sayisi,
                                        daire_sayisi,
                                        isyeri_sayisi,
                                        yukseklik,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""ADR_BINA""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves the count of ADR_BINA entities within the specified extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""ADR_BINA""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Adds a new ADR_BINA entity using native SQL to handle geometry transformation.
    /// </remarks>
    public async Task<AdrBina> AddAsync(AdrBina entity, CancellationToken cancellationToken)
    {
        Console.WriteLine(entity);

        var sql = @"
            INSERT INTO ""ADR_BINA"" (
                kodu,
                site_adi,
                adi,
                bina_kat_sayisi,
                daire_sayisi,
                isyeri_sayisi,
                yukseklik,
                geometry
            )
            VALUES (
                {0},
                {1},
                {2},
                {3},
                {4},
                {5},
                {6},
                ST_Transform(ST_GeomFromWKB({7}, 4326), 3857)
            )
            RETURNING id";

        var result = await _context.Database.SqlQueryRaw<int>(
            sql,
            entity.Kodu ?? (object)DBNull.Value,
            entity.SiteAdi ?? (object)DBNull.Value,
            entity.Adi ?? (object)DBNull.Value,
            entity.BinaKatSayisi,
            entity.DaireSayisi,
            entity.IsyeriSayisi,
            entity.Yukseklik,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        var id = result.Single();

        entity.Id = id;
        return entity;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Deletes an ADR_BINA entity by its ID using native SQL.
    /// </remarks>
    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""ADR_BINA"" WHERE id = {0}";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Updates an existing ADR_BINA entity using native SQL to handle geometry transformation and avoid updating searchable_text.
    /// </remarks>
    public async Task<AdrBina> UpdateAsync(AdrBina entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""ADR_BINA""
            SET
                kodu = {0},
                site_adi = {1},
                adi = {2},
                bina_kat_sayisi = {3},
                daire_sayisi = {4},
                isyeri_sayisi = {5},
                yukseklik = {6},
                geometry = ST_Transform(ST_GeomFromWKB({7}, 4326), 3857)
            WHERE id = {8}
            RETURNING id";

        var result = await _context.Database.SqlQueryRaw<int>(
            sql,
            entity.Kodu ?? (object)DBNull.Value,
            entity.SiteAdi ?? (object)DBNull.Value,
            entity.Adi ?? (object)DBNull.Value,
            entity.BinaKatSayisi,
            entity.DaireSayisi,
            entity.IsyeriSayisi,
            entity.Yukseklik,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"AdrBina with ID {entity.Id} not found.");
        }

        return entity;
    }
}
