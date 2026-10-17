using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Sudoku_Api;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Die Frontends laufen auf einem anderen Port (Vite) bzw. direkt als Datei (file://)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(origin => true));
});

// Ein relativer Datenbankpfad wird relativ zum Projektordner aufgelöst,
// damit die API auf jedem Rechner die Datenbank findet.
var connectionString = builder.Configuration.GetConnectionString("Context")
    ?? throw new InvalidOperationException("Connection string 'Context' fehlt in appsettings.json");
var sqliteBuilder = new SqliteConnectionStringBuilder(connectionString);
if (!Path.IsPathRooted(sqliteBuilder.DataSource))
{
    sqliteBuilder.DataSource = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, sqliteBuilder.DataSource));
}

builder.Services.AddDbContext<SudokuContext>(options =>
{
    options.UseSqlite(sqliteBuilder.ToString());

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
    }
});


var app = builder.Build();

// Legt Datenbank und Tabelle an, falls sie noch nicht existieren
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<SudokuContext>().Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
