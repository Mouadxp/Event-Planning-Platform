using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Event_Planning_Platform.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByToVenue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Venues",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Venues");
        }
    }
}
