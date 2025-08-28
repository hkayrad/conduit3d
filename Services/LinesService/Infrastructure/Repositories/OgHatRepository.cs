using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

public class OgHatRepository(LinesContext context) : IOgHatRepository
{
    private readonly LinesContext _context = context;
    private readonly DbSet<OgHat> _dbSet = context.Set<OgHat>();

    public async Task<List<OgHat>> GetAllAsync(int pageNumber,
                                        int pageSize,
                                        string sortBy,
                                        bool ascending,
                                        Extent extent,
                                        string? query,
                                        CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        cinsi, 
                                        tipi,
                                        kesit,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_OGHAT""
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

    public async Task<OgHat?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        cinsi, 
                                        tipi,
                                        kesit,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_OGHAT""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_OGHAT""
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await sqlQuery.CountAsync(cancellationToken);
    }

    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Cinsi).Distinct().ToListAsync(cancellationToken);
    }
}
