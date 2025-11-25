using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;
using PolesService.Infrastructure.Data;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Entity Framework Core implementation of <see cref="IArmaturRepository"/> for managing Og_Mus_Direk entities.
/// </summary>
/// <param name="context">Database context.</param>
/// <remarks>
/// This class is implements the <see cref="IArmaturRepository"/> interface and provides methods for managing Armatur entities.
/// </remarks>
public class ArmaturRepository(PolesContext context) : IArmaturRepository
{
    /// <summary>
    /// Poles database context
    /// </summary>
    private readonly PolesContext _context = context;

    /// <summary>
    /// Db_Set for Armatur entities
    /// </summary>
    private readonly DbSet<Armatur> _dbSet = context.Set<Armatur>();

    /// <inheritdoc />
    /// <summary>
    /// Retrieves all Armatur entities with pagination, sorting, and filtering options using native SQL.
    /// </summary>
    public async Task<List<Armatur>> GetAllAsync(int pageNumber,
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
                                        bagli_tablo_id,
                                        bagli_tablo_kayit_id,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb
                                    FROM ""SBK_ARMATUR""
                                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope(
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
    /// <summary>
    /// This method retrieves a single Og_Mus_Direk entity by its ID using native SQL.
    /// </summary>
    public async Task<Armatur?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
        var sqlQuery = _dbSet.FromSql($@"SELECT
                                        id,
                                        bagli_tablo_id,
                                        bagli_tablo_kayit_id,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb
                                    FROM ""SBK_ARMATUR""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <summary>
    /// This method retrieves the count of Og_Mus_Direk entities within a specified spatial extent using native SQL.
    /// </summary>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_ARMATUR""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await sqlQuery.CountAsync(cancellationToken);
    }
}
