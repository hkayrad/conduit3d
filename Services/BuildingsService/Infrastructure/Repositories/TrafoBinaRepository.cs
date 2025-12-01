using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

/// <summary>
/// Repository for managing SBK_TRAFOBINATIP entities.
/// </summary>
/// <param name="context">Buildings context.</param>
/// <remarks>
/// This class implements the ITrafoBinaRepository interface and provides methods for managing SBK_TRAFOBINATIP entities.
/// </remarks>
public class TrafoBinaRepository(BuildingsContext context) : ITrafoBinaRepository
{
    /// <summary>
    /// Buildings context.
    /// </summary>
    private readonly BuildingsContext _context = context ?? throw new ArgumentNullException(nameof(context));

    /// <summary>
    /// SBK_TRAFOBINATIP DbSet.
    /// </summary>
    private readonly DbSet<TrafoBina> _dbSet = context.Set<TrafoBina>();

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves all SBK_TRAFOBINATIP entities with pagination and sorting using native SQL.
    /// </remarks>
    public async Task<List<TrafoBina>> GetAllAsync(int pageNumber,
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
                                        adi, 
                                        kodu,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_TRAFOBINATIP""
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
    /// Retrieves a single SBK_TRAFOBINATIP entity by its ID using native SQL.
    /// </remarks>
    public async Task<TrafoBina?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson,
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        kodu,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_TRAFOBINATIP""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves the count of SBK_TRAFOBINATIP entities within the specified extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_TRAFOBINATIP""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }
    public async Task<TrafoBina> AddAsync(TrafoBina entity, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ""SBK_TRAFOBINATIP"" (adi, kodu, geometry)
            VALUES (@p0, @p1, ST_Transform(ST_GeomFromWKB(@p2, 4326), 3857))
            RETURNING id, adi, kodu, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<TrafoBina>(
            sql,
            entity.Adi,
            entity.Kodu,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        return result.Single();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""SBK_TRAFOBINATIP"" WHERE id = @p0";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<TrafoBina> UpdateAsync(TrafoBina entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""SBK_TRAFOBINATIP""
            SET
                adi = @p0,
                kodu = @p1,
                geometry = ST_Transform(ST_GeomFromWKB(@p2, 4326), 3857)
            WHERE id = @p3
            RETURNING id, adi, kodu, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<TrafoBina>(
            sql,
            entity.Adi,
            entity.Kodu,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"TrafoBina with ID {entity.Id} not found.");
        }

        return result.Single();
    }
}
