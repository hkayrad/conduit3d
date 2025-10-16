using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;
using PolesService.Infrastructure.Data;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Entity Framework Core implementation of <see cref="IOgMusDirekRepository"/> for managing Og_Mus_Direk entities.
/// </summary>
/// <param name="context">Database context.</param>
/// <remarks>
/// This class is implements the <see cref="IOgMusDirekRepository"/> interface and provides methods for managing Og_Mus_Direk entities.
/// </remarks>
public class OgMusDirekRepository(PolesContext context) : IOgMusDirekRepository
{
    /// <summary>
    /// Poles database context
    /// </summary>
    private readonly PolesContext _context = context;

    /// <summary>
    /// Db_Set for Og_Mus_Direk entities
    /// </summary>
    private readonly DbSet<OgMusDirek> _dbSet = context.Set<OgMusDirek>();

    /// <inheritdoc />
    /// <summary>
    /// Retrieves all Og_Mus_Direk entities with pagination, sorting, and filtering options using native SQL.
    /// </summary>
    public async Task<List<OgMusDirek>> GetAllAsync(int pageNumber,
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
                                        tipi,
                                        direk_no,
                                        boy_ozellik,
                                        direk_boy_id,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_OGMUSDIREK""
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
    /// <summary>
    /// This method retrieves a single Og_Mus_Direk entity by its ID using native SQL.
    /// </summary>
    public async Task<OgMusDirek?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        // ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id,
                                        kodu,
                                        adi,
                                        cinsi,
                                        tipi,
                                        direk_no,
                                        boy_ozellik,
                                        direk_boy_id,
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb,
                                        searchable_text
                                    FROM ""SBK_OGMUSDIREK""
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
                    FROM ""SBK_OGMUSDIREK""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves a list of distinct Og_Mus_Direk types using EF LINQ.
    /// </remarks>
    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Tipi).Distinct().ToListAsync(cancellationToken);
    }
}
