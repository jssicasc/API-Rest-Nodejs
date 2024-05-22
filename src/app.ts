import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { knex } from './database'
import { transactionsRoutes } from './routes/transactions'

export const app = fastify() // permite fzr a base da aplicação, e utilizando app é possível fzr todas as funcionalidades simples das aplicações web, como as rotas

// Vale destacar q a ORDEM q os plugins são registrados tbm é a ORDEM q o fastify vai EXECUTAR, logo deve ter CUIDADO com isso
// TANTO-É-QUE como deseja utilizar os cookies dentro das rotas ENTÃO ele deve ser registrado ANTES
app.register(cookie)

// NOTE-QUE o 2º arg DEFINE o PREFIXO PADRÃO do plugin indicado no 1º arg, logo todas as rotas q começarem com /transactions serão direcionadas presse plugin
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

// coloquei dps só para fins de testes (p ver oq acontece)
app.addHook('preHandler', async (request) => {
  console.log(`[${request.method}] ${request.url}`)
})

app.get('/hello', async () => {
  console.log('Alguém chamou o hello? u.u')
  return 'hello world u.u'
})

app.get('/infos', async () => {
  const tables = await knex('sqlite_schema').select('*') // como é apenas um tst de funcionamento básico do bd utilizou essa tabela, pq ela é criada automaticamente em todo bd e dentro dela tem informações sobre as outras tabelas
  // como a consulta é uma promise utiliza o await p aguardar a finalização
  return tables
})
