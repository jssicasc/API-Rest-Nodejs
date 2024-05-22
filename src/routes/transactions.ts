import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { error } from 'console'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { request } from 'http'

// Todo plugin do fastify precisa ser uma função assíncrona
export async function transactionsRoutes(app: FastifyInstance) {
  // O código DENTRO de addHook é uma definição GLOBAL PARA O CONTEXTO DO PLUGIN
  // logo será executado INDEPENDENTE da rota requisitada Deste plugin
  // NOTE-QUE o 1º Arg é o "evento" q disparará o código, dento q o preHandler é o momento ANTERIOR a execução do Handler da rota, então é uma definição semelhante com a do Middleware
  // LEMBRANDO-QUE por ser um exemplo simples então a função foi passada diretamente, MAS ela tbm poderia estar num arq dentro de middlewares
  app.addHook('preHandler', async (request) => {
    console.log('Alguém chamou TRANSACTs? lol')
  })
  // Como TODAS As Rotas DENTRO desse plugin vão INICIAR com /transaction então esse PREFIXO PADRÃO fica DEFINIDO no Register do server.ts, e neste arq só a / já serve como a referência pra ele
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()
        .orderBy('title') // ao deixar o select vazio por padrão ele já funciona igual ao select('*')

      // O uso do objeto "envolvendo" o transactions é pq o retorno da consulta é dado dentro de um array,
      // daí se for necessário acrescentar novas informações basta adicionar nesse objeto do return, e esses acréscimos não quebrarão possíveis implementações já feitas usando o array do resultado...
      return { transactions }
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    // para acessar os parâmetros nomeados q são passados na URL utiliza o request.params

    // o request.params sempre é um objeto, IAI espera-se que dentro dele tenha o id
    const getTrasactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTrasactionParamsSchema.parse(request.params)

    // Apesar de já esperarmos q essa consulta retorne APENAS UM Registro o knex irá retorná-la como um array,
    // então ao usar o .first() o knex já retorna como objeto (ou undefined caso não traga registros) iai EVITA o array
    // passar o objeto é equivalente a ter adicionado o andWhere
    // ALÉM-DISSO Como o Nome da chave é IGUAL ao nome do valor então não foi necessário adicionar o :id (short sintaxe)
    const transaction = await knex('transactions')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    console.log('get by id | sessionId: ' + sessionId)
    return { transaction }
  })

  // Rota para CRIAÇÃO da transaction
  app.post('/', async (request, reply) => {
    // o request.body sempre é um objeto, IAI espera-se que dentro dele tenha Pelo Menos os campos com esse tipo, assim é possível VALIDAR & TIPAR o body
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // VALIDANDO os dados do request.body p ver se eles batem com o schema definido
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId
    // verifica se a sessionId existe nos cookies do usuários, Caso NÃO Exista ENTÃO
    if (!sessionId) {
      sessionId = randomUUID()

      // maneira de salvar a informação no cookie:
      // o 3º parâmetro são as configurações do cookie, sendo q o path define em quais rotas do backend esse cookie estará disponível, o uso da '/' define q QUALQUER rota pode acessar esses cookies
      // além disso todo cookie salvo no navegador do usuário em algum momento será EXPIRADO,
      // e essa informação pode ser passada de 2 maneiras: o expires recebe uma Data EXATA de quando o cookie irá expirar, já o maxAge recebe a duração do cookie no navegador em SEGUNDOS (isso pode ser conferido ao passar o mouse em cima da propriedade OU na documentação meixmo)
      // NOTE TAMBÉM QUE o tempo não foi informado em seu valor bruto mas sim como MULTIPLICAÇÃO, ficando mais fácil "decifrar" oq está ocorrendo... ALÉM DISSO tem o comentário p ajudar a decifrar o significado do número
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 Dias
      })
    }

    // como a tabela de transactions NÃO Tem um type então essa informação fica "embutida" no valor do amount, iai nem precisa verificar o type p saber se é crédito ou débito
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amout: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    // OBS: Em rotas de CRIAÇÃO de API geralmente retornos NÃO São feitos
    // LEMBRANDO-QUE o código 201 já simboliza Recurso criado COM Sucesso, sendo q o fastify prefere chamar a resposta de REPLY
    console.log('CRIAÇÃO de transaction')
    return reply.status(201).send()
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amout', { as: 'amount' })
        .first() // este sum tbm irá somar TODOS os valores duma coluna
      // o first tbm é p não trazer o resultado como array,
      // mas ainda assim o nome da coluna é trazido como a operação q tá sendo feita, por isso passou o 2º parâmetro indicando o nome da coluna //

      return { summary }
    },
  )
}
