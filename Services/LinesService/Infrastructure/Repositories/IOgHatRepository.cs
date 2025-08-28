using System;
using Conduit3D.Common.Infrastructure.Repositories;
using LinesService.Domain;

namespace LinesService.Infrastructure.Repositories;

public interface IOgHatRepository : IGenericRepository<OgHat>
{
    public Task<List<string>> GetTipListAsync(CancellationToken cancellationToken);
}
