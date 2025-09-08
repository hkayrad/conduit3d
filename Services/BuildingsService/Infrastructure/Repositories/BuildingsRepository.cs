using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

/// <summary>
/// Repository for managing building entities.
/// </summary>
/// <param name="context">Buildings context.</param>
/// <remarks>
/// This class implements the IBuildingsRepository interface and provides methods for managing building entities.
/// </remarks>
public class BuildingsRepository(BuildingsContext context) : IBuildingsRepository
{
    /// <summary>
    /// Buildings context.
    /// </summary>
    private readonly BuildingsContext _context = context;

    /// <summary>
    /// Buildings DbSet.
    /// </summary>
    private readonly DbSet<Building> _dbSet = context.Set<Building>();

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves all buildings with pagination and sorting using native SQL.
    /// </remarks>
    public async Task<List<Building>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            string? query,
                                            CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        name, 
                                        type,
                                        floor_count,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM buildings
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
    /// Retrieves a single building by its ID using native SQL.
    /// </remarks>
    public async Task<Building?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        name, 
                                        type, 
                                        floor_count,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM buildings
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// Retrieves the count of buildings within the specified extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM buildings
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await sqlQuery.CountAsync(cancellationToken);
    }
}
