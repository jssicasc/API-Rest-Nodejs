import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.uuid('session_id').after('id').index() // o método after faz o POSICIONAMENTO dessa nova coluna APÓS a q foi indicada no argumento ('id'), mas nem todos os BDs suportam isso
    // além disso o indíce é usado p falar pro BD q será feita muitas buscas em transações específicas de um id de uma sessão (session_id)
    // OU SEJA o session_id será muito utilizado dentro do where, assim a busca ficará mais rápida pois o bd cria tipo um cache de qual session_id possuem quais id
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('session_id')
  })
}
