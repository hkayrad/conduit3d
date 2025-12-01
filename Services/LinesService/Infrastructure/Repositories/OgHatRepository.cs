using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

/// <summary>
/// Entity Framework Core implementation of <see cref="IOgHatRepository"/> for managing OG_HAT entities.
/// </summary>
/// <param name="context">Database context.</param>
/// <remarks>
/// This class implements the <see cref="IOgHatRepository"/> interface and provides methods for managing OG_HAT entities.
/// </remarks>
public class OgHatRepository(LinesContext context) : IOgHatRepository
{
    /// <summary>
    /// Lines database context.
    /// </summary>
    private readonly LinesContext _context = context;

    /// <summary>
    /// DbSet for OG_HAT entities.
    /// </summary>
    private readonly DbSet<OgHat> _dbSet = context.Set<OgHat>();

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves all OG_HAT entities with pagination, sorting, and filtering options using native SQL.
    /// </remarks>
    public async Task<List<OgHat>> GetAllAsync(int pageNumber,
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
                                        adi,
                                        cinsi,
                                        kesit,
                                        tipi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_OGHAT""
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
    /// This method retrieves an OG_HAT entity by its ID using native SQL.
    /// </remarks>
    public async Task<OgHat?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        kodu,
                                        adi,
                                        cinsi,
                                        kesit,
                                        tipi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_OGHAT""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves the count of OG_HAT entities within a specified spatial extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_OGHAT""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves a list of distinct OG_HAT types using EF LINQ.
    /// </remarks>
    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Cinsi).Distinct().ToListAsync(cancellationToken);
    }

    public async Task<OgHat> AddAsync(OgHat entity, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ""SBK_OGHAT"" (kodu, adi, cinsi, kesit, tipi, geometry)
            VALUES (@p0, @p1, @p2, @p3, @p4, ST_Transform(ST_GeomFromWKB(@p5, 4326), 3857))
            RETURNING id, kodu, adi, cinsi, kesit, tipi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<OgHat>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Cinsi,
            entity.Kesit,
            entity.Tipi,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        return result.Single();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""SBK_OGHAT"" WHERE id = @p0";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<OgHat> UpdateAsync(OgHat entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""SBK_OGHAT""
            SET
                kodu = @p0,
                adi = @p1,
                cinsi = @p2,
                kesit = @p3,
                tipi = @p4,
                geometry = ST_Transform(ST_GeomFromWKB(@p5, 4326), 3857)
            WHERE id = @p6
            RETURNING id, kodu, adi, cinsi, kesit, tipi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<OgHat>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Cinsi,
            entity.Kesit,
            entity.Tipi,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"OgHat with ID {entity.Id} not found.");
        }

        return result.Single();
    }
}
