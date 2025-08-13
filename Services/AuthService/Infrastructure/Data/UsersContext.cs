using System;
using AuthService.Domain;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Data;

public class UsersContext(DbContextOptions options) : DbContext(options)
{
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

            entity.Property(e => e.UserType)
                .IsRequired()
                .HasMaxLength(1)
                .HasColumnType("char")
                .HasColumnName("user_type");

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("varchar(100)")
                .HasColumnName("name");

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp")
                .HasColumnName("created_at");
        });
    }
}
