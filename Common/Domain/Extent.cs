using System;

namespace Conduit3D.Common.Domain;

public class Extent()
{
    public double MinX { get; set; }
    public double MinY { get; set; }
    public double MaxX { get; set; }
    public double MaxY { get; set; }

    public bool IsValid()
    {
        return MinX < MaxX && MinY < MaxY;
    }
}
