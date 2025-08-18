using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

public class BuildingsRepository(BuildingsContext context) : IRepository<Building>
{
    private readonly BuildingsContext _context = context;
    private readonly DbSet<Building> _dbSet = context.Set<Building>();

    public async Task<List<Building>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
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
            query = query.OrderBy(x => EF.Property<object>(x, sortBy));
        else
            query = query.OrderByDescending(x => EF.Property<object>(x, sortBy));

        query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Building?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        name, 
                                        type, 
                                        floor_count,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM buildings
                                    WHERE id = {id}");
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT *
                    FROM buildings
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await query.CountAsync(cancellationToken);
    }
}
