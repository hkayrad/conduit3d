using System;
using BuildingsService.Domain;
using Conduit3D.Common.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure.Repositories;

public interface IAdrYolRepository : IGenericRepository<AdrYol>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
    Task<AdrYol> AddAsync(AdrYol entity, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<AdrYol> UpdateAsync(AdrYol entity, CancellationToken cancellationToken);
}
