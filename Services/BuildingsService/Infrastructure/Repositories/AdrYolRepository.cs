using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

public class AdrYolRepository(BuildingsContext context) : IAdrYolRepository
{
    private readonly BuildingsContext _context = context ?? throw new ArgumentNullException(nameof(context));

    private readonly DbSet<AdrYol> _dbSet = context.Set<AdrYol>();

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves all ADR_YOL entities with pagination and sorting using native SQL.
    /// </remarks>
    public async Task<List<AdrYol>> GetAllAsync(int pageNumber,
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
                                        genislik,
                                        serit_sayisi,
                                        yapisi,
                                        tipi,
                                        kodu,
                                        adi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""ADR_YOL""
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
    public async Task<AdrYol?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson

        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id,
                                        genislik,
                                        serit_sayisi,
                                        yapisi,
                                        tipi,
                                        kodu,
                                        adi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""ADR_YOL""
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
                    FROM ""ADR_YOL""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Tipi).Distinct().ToListAsync(cancellationToken);
    }

    public async Task<AdrYol> AddAsync(AdrYol entity, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ""ADR_YOL"" (genislik, serit_sayisi, yapisi, tipi, kodu, adi, geometry)
            VALUES (@p0, @p1, @p2, @p3, @p4, @p5, ST_Transform(ST_GeomFromWKB(@p6, 4326), 3857))
            RETURNING id, genislik, serit_sayisi, yapisi, tipi, kodu, adi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<AdrYol>(
            sql,
            entity.Genislik,
            entity.SeritSayisi,
            entity.Yapisi,
            entity.Tipi,
            entity.Kodu,
            entity.Adi,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        return result.Single();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""ADR_YOL"" WHERE id = @p0";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<AdrYol> UpdateAsync(AdrYol entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""ADR_YOL""
            SET
                genislik = @p0,
                serit_sayisi = @p1,
                yapisi = @p2,
                tipi = @p3,
                kodu = @p4,
                adi = @p5,
                geometry = ST_Transform(ST_GeomFromWKB(@p6, 4326), 3857)
            WHERE id = @p7
            RETURNING id, genislik, serit_sayisi, yapisi, tipi, kodu, adi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<AdrYol>(
            sql,
            entity.Genislik,
            entity.SeritSayisi,
            entity.Yapisi,
            entity.Tipi,
            entity.Kodu,
            entity.Adi,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"AdrYol with ID {entity.Id} not found.");
        }

        return result.Single();
    }
}
