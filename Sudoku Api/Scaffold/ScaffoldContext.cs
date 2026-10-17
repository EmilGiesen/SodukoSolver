using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Sudoku_Api.Scaffold;

public partial class ScaffoldContext : DbContext
{
    public ScaffoldContext()
    {
    }

    public ScaffoldContext(DbContextOptions options)
        : base(options)
    {
    }

    public virtual DbSet<SudokuGame> SudokuGames { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Nur als Fallback (z. B. für Scaffold-Befehle); die API konfiguriert den Context in Program.cs
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlite("Name=ConnectionStrings:Context");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SudokuGame>(entity =>
        {
            entity.HasIndex(e => e.Id, "IX_SudokuGames_Id").IsUnique();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
