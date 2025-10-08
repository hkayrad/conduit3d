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
                                        ST_AsBinary(ST_Transform(geometry, 4326)) as wkb
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
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }
}
