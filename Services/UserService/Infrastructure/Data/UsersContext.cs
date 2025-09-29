using System;
using UserService.Domain;
using Microsoft.EntityFrameworkCore;

namespace UserService.Infrastructure.Data;

/// <summary>
/// Database context for managing user-related data.
/// </summary>
/// <param name="options">DbContext options.</param>
public class UsersContext(DbContextOptions options) : DbContext(options)
{
    /// <summary>
    /// DbSet for users entities
    /// </summary>
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pk");

            entity.ToTable("users");

            entity.Property(e => e.Id)
                .IsRequired()
                .HasColumnType("int4")
                .HasColumnName("id");

            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("varchar(100)")
                .HasColumnName("username");

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("varchar(255)")
                .HasColumnName("email");

            entity.Property(e => e.UserRole)
                .IsRequired()
                .HasMaxLength(10)
                .HasColumnType("varchar(10)")
                .HasColumnName("user_role");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("varchar(100)")
                .HasColumnName("name");

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp")
                .HasColumnName("created_at");

            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasColumnType("boolean")
                .HasColumnName("is_active");

            entity.HasGeneratedTsVectorColumn(
                p => p.SearchableText,
                "simple",
                p => new { p.Id, p.Username, p.Email, p.UserRole, p.Name, p.CreatedAt, p.IsActive }
            );
        });
    }
}
