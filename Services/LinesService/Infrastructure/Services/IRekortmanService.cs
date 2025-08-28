using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using LinesService.Domain;

namespace LinesService.Infrastructure.Services;

public interface IRekortmanService : IGenericService<Rekortman>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);

}
