using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Event_Planning_Platform.Migrations
{
    /// <inheritdoc />
    public partial class SeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Venues",
                columns: new[] { "Id", "Address", "Capacity", "Name" },
                values: new object[,]
                {
                    { 1, "123 Main St", 200, "Grand Hall" },
                    { 2, "456 River Rd", 120, "River Loft" }
                });

            migrationBuilder.InsertData(
                table: "Events",
                columns: new[] { "Id", "Description", "End", "Start", "Title", "VenueId" },
                values: new object[,]
                {
                    { 1, "A social meetup for local professionals", new DateTime(2026, 5, 20, 21, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 5, 20, 18, 0, 0, 0, DateTimeKind.Unspecified), "Spring Networking Mixer", 1 },
                    { 2, "Local artists and food vendors", new DateTime(2026, 6, 10, 16, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 6, 10, 10, 0, 0, 0, DateTimeKind.Unspecified), "Community Art Fair", 2 }
                });

            migrationBuilder.InsertData(
                table: "Attendees",
                columns: new[] { "Id", "Email", "EventId", "IsAttending", "Name" },
                values: new object[,]
                {
                    { 1, "alice@example.com", 1, true, "Alice Johnson" },
                    { 2, "bob@example.com", 1, true, "Bob Smith" },
                    { 3, "catherine@example.com", 2, true, "Catherine Lee" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Attendees",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Attendees",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Attendees",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
