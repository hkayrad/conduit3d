using System;

namespace Conduit3D.Common.Domain;

public class Extent(double minX, double minY, double maxX, double maxY)
{
    public double MinX { get; set; } = minX;
    public double MinY { get; set; } = minY;
    public double MaxX { get; set; } = maxX;
    public double MaxY { get; set; } = maxY;

    public bool IsValid => MinX < MaxX && MinY < MaxY;
}
