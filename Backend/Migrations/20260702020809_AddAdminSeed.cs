using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BaayuLok.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Avatar", "CreatedAt", "Email", "FullName", "GoogleId", "KYCStatus", "PasswordHash", "Role", "UpdatedAt" },
                values: new object[] { new Guid("11111111-2222-3333-4444-555555555555"), null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@abc.com", "Admin", null, "Verified", "$2b$11$6M9.IJXqCt4ZV/brjM5s2ODTCirD3ULFNx8yw9XsVHyKqx6xahGCy", "Admin", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-3333-4444-555555555555"));
        }
    }
}
