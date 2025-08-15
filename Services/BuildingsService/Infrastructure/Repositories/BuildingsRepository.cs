using System;
using BuildingsService.Domain;
using BuildingsService.Infrastructure.Data;

namespace BuildingsService.Infrastructure.Repositories;

public class BuildingsRepository(BuildingsContext context) : GenericRepository<Building>(context)
{
}
