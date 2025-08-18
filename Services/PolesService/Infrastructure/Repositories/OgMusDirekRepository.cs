using System;
using Conduit3D.Common.Domain;
using Microsoft.EntityFrameworkCore;
using PolesService.Domain;
using PolesService.Infrastructure.Data;

namespace PolesService.Infrastructure.Repositories;

public class OgMusDirekRepository(PolesContext context) : IGenericRepository<OgMusDirek>
{
    private readonly PolesContext _context = context;
    private readonly DbSet<OgMusDirek> _dbSet = context.Set<OgMusDirek>();

    public async Task<List<OgMusDirek>> GetAllAsync(int pageNumber,
                                        int pageSize,
                                        string sortBy,
                                        bool ascending,
                                        Extent extent,
                                        CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        cinsi, 
                                        tipi,
                                        direk_no,
                                        boy_ozellik,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_OGMUSDIREK""
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

    public async Task<OgMusDirek?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT 
                                        id, 
                                        cinsi, 
                                        tipi,
                                        direk_no,
                                        boy_ozellik,
                                        ST_AsGeoJSON(ST_Transform(geometry, 4326)) as geojson
                                    FROM ""SBK_OGMUSDIREK""
                                    WHERE id = {id}");
        return await query.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        var query = _dbSet.FromSql($@"SELECT *
                    FROM ""SBK_OGMUSDIREK""
                    WHERE ST_Transform(geometry, 4326) @ ST_MakeEnvelope({extent.MinX}, {extent.MinY}, {extent.MaxX}, {extent.MaxY}, 4326)");

        return await query.CountAsync(cancellationToken);
    }
}
