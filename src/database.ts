// Arquivo responsável por fazer a conexão com o banco

// o Knex (K MAIÚSCULO) é uma interface com todas as opções possíveis de configuração
// sua importação foi p aproveitar oq foi definido na estrutura dela, assim, por ex é possível usar o autocomplete das sugestões, por isso definiu config : Knex
import { knex as setupKnex, Knex } from 'knex' // renomeou p q pudesse usar o nome knex na exportação
import { env } from './env'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
// NoteQue client e connection são opções obrigatórias, sendo q pro SQLite só precisa informar o arquivo
// Além disso o CAMINHO é RELATIVO ao LOCAL de execução do código, logo ./ é a RAIZ, nela tem a pasta tmp
// a ideia é q o sqlite seja usado apenas em desenvolvimento, por isso o path db/app.db está na lista do .gitignore
