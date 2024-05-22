import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // o await assume o lugar do return
  // NOTE-QUE o table fornece métodos diversos p criar os campos da tabela de acordo com o tipo necessário
  // por ex o uuid foi usado p gerar um id aleatório, em vez de incremental, pq é mais difícil de ser descoberto
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary() // TRADUZINDO: O método recebe o nome da coluna q será criada e por fim tem o primary indicando q ela é chave primária
    table.text('title').notNullable() // a coluna denominada title NÃO Pode ser nulla
    table.decimal('amout', 10, 2).notNullable() // o 1º arg é o TAMANHO do número q quer armazenar e o 2º é a QUANTIDADE de Casas Decimais
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable() // passando o now() dessa maneira a expressão NÃO DEPENDERÁ de um banco específico p funcionar
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions')
}
