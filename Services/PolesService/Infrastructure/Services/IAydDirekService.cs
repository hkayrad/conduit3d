using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using PolesService.Domain;

namespace PolesService.Infrastructure.Services;

public interface IAydDirekService : IGenericService<AydDirek>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
}
