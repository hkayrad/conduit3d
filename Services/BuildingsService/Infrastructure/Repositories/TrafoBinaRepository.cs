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
    private readonly BuildingsContext _context = context;

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
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        kodu,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson,
                                        searchable_text
                                    FROM ""SBK_TRAFOBINATIP""
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
    /// Retrieves a single SBK_TRAFOBINATIP entity by its ID using native SQL.
    /// </remarks>
    public async Task<TrafoBina?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        kodu,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
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
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }
}
