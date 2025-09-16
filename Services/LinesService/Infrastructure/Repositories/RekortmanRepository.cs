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
                                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope(
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
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb
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
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

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
}
