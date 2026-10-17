using Microsoft.EntityFrameworkCore;
using Sudoku_Api.Scaffold;

namespace Sudoku_Api
{
    public class SudokuContext : ScaffoldContext
    {
        public SudokuContext(DbContextOptions options) : base(options) { }
    }
}
