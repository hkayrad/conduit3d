using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Utilities;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;
using PolesService.Infrastructure.Data;

namespace PolesService.Infrastructure.Repositories;

/// <summary>
/// Entity Framework Core implementation of <see cref="IAgDirekRepository"/> for managing AG_DIREK entities.
/// </summary>
/// <param name="context">Database context.</param>
/// <remarks>
/// This class is implements the <see cref="IAgDirekRepository"/> interface and provides methods for managing AG_DIREK entities.
/// </remarks>
public class AgDirekRepository(PolesContext context) : IAgDirekRepository
{
    /// <summary>
    /// Poles database context
    /// </summary>
    private readonly PolesContext _context = context;

    /// <summary>
    /// Db_Set for AG_DIREK entities
    /// </summary>
    private readonly DbSet<AgDirek> _dbSet = context.Set<AgDirek>();

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves all AG_DIREK entities with pagination, sorting, and filtering options using native SQL.
    /// </remarks>
    public async Task<List<AgDirek>> GetAllAsync(int pageNumber,
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
                                    FROM ""SBK_AGDIREK""
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
    /// This method retrieves a single AG_DIREK entity by its ID using native SQL.
    /// </remarks>
    public async Task<AgDirek?> GetByIdAsync(int id, CancellationToken cancellationToken)
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
                                    FROM ""SBK_AGDIREK""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves the count of AG_DIREK entities within a specified spatial extent using native SQL.
    /// </remarks>
    public async Task<int> GetCountAsync(Extent extent, string? query, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_AGDIREK""
                    WHERE ST_Transform(geometry, 4326) && ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (!string.IsNullOrWhiteSpace(query))
            sqlQuery = sqlQuery.Where(u => u.SearchableText.Matches(
                EF.Functions.ToTsQuery("simple", ParseTsQuery.ConvertToTsQuery(query))
            ));

        return await sqlQuery.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    /// <remarks>
    /// This method retrieves a list of distinct AG_DIREK types using EF LINQ.
    /// </remarks>
    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Tipi).Distinct().ToListAsync(cancellationToken);
    }

    public async Task<AgDirek> AddAsync(AgDirek entity, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ""SBK_AGDIREK"" (kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id, geometry)
            VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, ST_Transform(ST_GeomFromWKB(@p7, 4326), 3857))
            RETURNING id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<AgDirek>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Cinsi,
            entity.Tipi,
            entity.DirekNo,
            entity.BoyOzellik,
            entity.DirekBoyId,
            entity.Wkb
        ).ToListAsync(cancellationToken);

        return result.Single();
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var sql = @"DELETE FROM ""SBK_AGDIREK"" WHERE id = @p0";
        var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, new object[] { id }, cancellationToken);
        return rowsAffected > 0;
    }

    public async Task<AgDirek> UpdateAsync(AgDirek entity, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE ""SBK_AGDIREK""
            SET
                kodu = @p0,
                adi = @p1,
                cinsi = @p2,
                tipi = @p3,
                direk_no = @p4,
                boy_ozellik = @p5,
                direk_boy_id = @p6,
                geometry = ST_Transform(ST_GeomFromWKB(@p7, 4326), 3857)
            WHERE id = @p8
            RETURNING id, kodu, adi, cinsi, tipi, direk_no, boy_ozellik, direk_boy_id, ST_AsBinary(ST_Transform(geometry, 4326)) as wkb, searchable_text";

        var result = await _context.Database.SqlQueryRaw<AgDirek>(
            sql,
            entity.Kodu,
            entity.Adi,
            entity.Cinsi,
            entity.Tipi,
            entity.DirekNo,
            entity.BoyOzellik,
            entity.DirekBoyId,
            entity.Wkb,
            entity.Id
        ).ToListAsync(cancellationToken);

        if (!result.Any())
        {
            throw new KeyNotFoundException($"AgDirek with ID {entity.Id} not found.");
        }

        return result.Single();
    }
}
