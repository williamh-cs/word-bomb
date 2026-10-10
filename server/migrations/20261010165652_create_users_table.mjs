
export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.string("username", 30).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}
