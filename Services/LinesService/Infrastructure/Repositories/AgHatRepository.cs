using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

public class AgHatRepository(LinesContext context) : IAgHatRepository
{
    private readonly LinesContext _context = context;
    private readonly DbSet<AgHat> _dbSet = context.Set<AgHat>();

    public async Task<List<AgHat>> GetAllAsync(int pageNumber,
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
                                    FROM ""SBK_AGHAT""
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

    public async Task<AgHat?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        cinsi, 
                                        tipi,
                                        kesit,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_AGHAT""
                                    WHERE id = {id}");
        return await sqlQuery.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var sqlQuery = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_AGHAT""
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await sqlQuery.CountAsync(cancellationToken);
    }

    public async Task<List<string>> GetTipListAsync(CancellationToken cancellationToken)
    {
        return await _dbSet.Select(x => x.Cinsi).Distinct().ToListAsync(cancellationToken);
    }
}
