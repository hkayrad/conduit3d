using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

/// <summary>
/// Entity Framework Core implementation of <see cref="IRekortmanRepository"/> for managing REKORTMAN entities.
/// </summary>
/// <param name="context">Database context.</param>
/// <remarks>
/// This class implements the <see cref="IRekortmanRepository"/> interface and provides methods for managing REKORTMAN entities.
/// </remarks>
public class RekortmanRepository(LinesContext context) : IRekortmanRepository
{
    /// <summary>
    /// Lines database context.
    /// </summary>
    private readonly LinesContext _context = context;

    /// <summary>
    /// DbSet for REKORTMAN entities.
    /// </summary>
    private readonly DbSet<Rekortman> _dbSet = context.Set<Rekortman>();

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves all REKORTMAN entities with pagination, sorting, and filtering options using native SQL.
    /// </remarks>
    public async Task<List<Rekortman>> GetAllAsync(int pageNumber,
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
                                        kesit,
                                        tipi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_rEKORTMAN""
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
    /// This method retrieves an REKORTMAN entity by its ID using native SQL.
    /// </remarks>
    public async Task<Rekortman?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        kodu,
                                        adi,
                                        kesit,
                                        tipi,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_rEKORTMAN""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves the count of REKORTMAN entities within a specified spatial extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_rEKORTMAN""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves a list of distinct REKORTMAN types using EF LINQ.
    /// </remarks>
    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Tipi).Distinct().ToListAsync(cancellationToken);
    }

    public async Task<Rekortman> AddAsync(Rekortman entity, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ""SBK_rEKORTMAN"" (kodu, adi, kesit, tipi, geometry)
            VALUES (@p0, @p1, @p2, @p3, ST_Transform(ST_GeomFromWKB(@p4, 4326), 3857))
            RETURNING id, kodu, adi, kesit, tipi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<Rekortman>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Kesit,
            entity.Tipi,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        return result.Single();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""SBK_rEKORTMAN"" WHERE id = @p0";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<Rekortman> UpdateAsync(Rekortman entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""SBK_rEKORTMAN""
            SET
                kodu = @p0,
                adi = @p1,
                kesit = @p2,
                tipi = @p3,
                geometry = ST_Transform(ST_GeomFromWKB(@p4, 4326), 3857)
            WHERE id = @p5
            RETURNING id, kodu, adi, kesit, tipi, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<Rekortman>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Kesit,
            entity.Tipi,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"Rekortman with ID {entity.Id} not found.");
        }

        return result.Single();
    }
}
