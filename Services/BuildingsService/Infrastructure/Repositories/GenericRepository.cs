using System;
using Conduit3D.Common.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

public class GenericRepository<T>(DbContext context) : IGenericRepository<T> where T : class
{
    private readonly DbContext _context = context;
    private readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<List<T>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT id, name, type, ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                    FROM buildings
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        if (ascending)
            query = query.OrderBy(x => EF.Property<object>(x, sortBy));
        else
            query = query.OrderByDescending(x => EF.Property<object>(x, sortBy));

        query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
