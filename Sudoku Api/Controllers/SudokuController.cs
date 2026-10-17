using Microsoft.AspNetCore.Mvc;
using Sudoku_Api.Scaffold;

namespace Sudoku_Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SudokuController : ControllerBase
    {
        SudokuContext _context;
        public SudokuController(SudokuContext context)
        {
            this._context = context;
        }

        // GET /Sudoku?name=xyz
        [HttpGet]
        public ActionResult<SudokuGame> Get([FromQuery] string name)
        {
            var game = FindLatestByName(name);
            if (game == null)
            {
                return NotFound();
            }
            return game;
        }

        // POST /Sudoku
        [HttpPost]
        public ActionResult<bool> Post(PostRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.GameState?.Length != 81 || request.ErrorState?.Length != 81)
            {
                return BadRequest(false);
            }

            // Gibt es den Namen schon, wird der Spielstand überschrieben
            var game = FindLatestByName(request.Name);
            if (game == null)
            {
                game = new SudokuGame { Name = request.Name };
                _context.SudokuGames.Add(game);
            }

            game.GameState = request.GameState;
            game.ErrorState = request.ErrorState;
            game.TimeToSolveInMs = request.TimeToSolveInMs;
            game.DateTime = DateTime.Now;
            _context.SaveChanges();

            return true;
        }

        private SudokuGame? FindLatestByName(string name)
        {
            return _context.SudokuGames
                .Where(game => game.Name == name)
                .OrderByDescending(game => game.Id)
                .FirstOrDefault();
        }
    }
}
public class PostRequest
{
    public string? Name { get; set; }
    public string? GameState { get; set; }
    public string? ErrorState { get; set; }
    public int TimeToSolveInMs { get; set; }
}
