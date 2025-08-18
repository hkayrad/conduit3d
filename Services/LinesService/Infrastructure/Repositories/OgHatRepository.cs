using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

public class OgHatRepository(LinesContext context) : IRepository<OgHat>
{
    private readonly LinesContext _context = context;
    private readonly DbSet<OgHat> _dbSet = context.Set<OgHat>();


    public Task<List<OgHat>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<OgHat?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
