using System;

namespace Conduit3D.Common.Domain;

/// <summary>
/// Represents a rectangular area in 2D space.
/// </summary>
/// <remarks>
/// This class is used to define the boundaries of a 2D area.
/// </remarks>
public class Extent
{
    /// <summary>
    /// Lower X boundary of the 2D area.
    /// </summary>
    public double MinX { get; set; }
    /// <summary>
    /// Lower Y boundary of the 2D area.
    /// </summary>
    public double MinY { get; set; }
    /// <summary>
    /// Upper X boundary of the 2D area.
    /// </summary>
    public double MaxX { get; set; }
    /// <summary>
    /// Upper Y boundary of the 2D area.
    /// </summary>
    public double MaxY { get; set; }

    /// <summary>
    /// Checks if the extent is valid.
    /// </summary>
    public bool IsValid()
    {
        return MinX < MaxX && MinY < MaxY;
    }
}
