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
        throw new NotImplementedException();
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
