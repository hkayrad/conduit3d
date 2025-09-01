using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
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
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        COALESCE(NULLIF(bina_kat_sayisi, 0), 5) as ""bina_kat_sayisi"",
                                        'residential' as type,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""ADR_BINA""
                                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope(
                                        {extent.MinX}, 
                                        {extent.MinY}, 
                                        {extent.MaxX},
                                        {extent.MaxY}, 
                                        4326
                                    )");

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
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        COALESCE(NULLIF(bina_kat_sayisi, 0), 5) as ""bina_kat_sayisi"",
                                        'residential' as type,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""ADR_BINA""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves the count of ADR_BINA entities within the specified extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""ADR_BINA""
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await sqlQuery.CountAsync(cancellationToken);
    }
}
