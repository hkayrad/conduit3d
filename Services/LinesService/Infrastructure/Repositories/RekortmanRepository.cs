using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LinesService.Infrastructure.Repositories;

public class RekortmanRepository(LinesContext context) : IGenericRepository<Rekortman>
{
    private readonly LinesContext _context = context;
    private readonly DbSet<Rekortman> _dbSet = context.Set<Rekortman>();

    public Task<List<Rekortman>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<Rekortman?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
