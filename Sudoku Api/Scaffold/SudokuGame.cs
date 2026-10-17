using System;
using System.Collections.Generic;

namespace Sudoku_Api.Scaffold;

public partial class SudokuGame
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? GameState { get; set; }

    public string? ErrorState { get; set; }

    public int? TimeToSolveInMs { get; set; }

    public DateTime? DateTime { get; set; }
}
