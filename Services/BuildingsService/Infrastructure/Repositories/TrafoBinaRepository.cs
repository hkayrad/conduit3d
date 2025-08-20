using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;
using Conduit3D.Common.Domain;
using Microsoft.EntityFrameworkCore;

namespace BuildingsService.Infrastructure.Repositories;

public class TrafoBinaRepository(BuildingsContext context) : IRepository<TrafoBina>
{
    private readonly BuildingsContext _context = context;
    private readonly DbSet<TrafoBina> _dbSet = context.Set<TrafoBina>();

    public async Task<List<TrafoBina>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        kodu,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_TRAFOBINATIP""
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

    public async Task<TrafoBina?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        adi, 
                                        kodu,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_TRAFOBINATIP""
                                    WHERE id = {id}");
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_TRAFOBINATIP""
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await query.CountAsync(cancellationToken);
    }
}
