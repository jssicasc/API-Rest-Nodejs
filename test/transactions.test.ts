import { expect, test, beforeAll, afterAll, describe } from 'vitest'
import { execSync } from 'node:child_process' // de dentro do child_process é possível pegar funções p executar SCRIPTS em paralelo, iai com a execSync é possível executar comandos no terminal por DENTRO da aplicação node
import request from 'supertest' // todo o módulo supertest fica disponível no local deniminado após o import (request neste caso)
import { app } from '../src/app' // LEMBRANDO QUE o app é a PORTA DE ENTRADA pra fzr requisições presta aplicação
import { beforeEach } from 'node:test'
// IAI ao fazer a importação do arquivo app (que NÃO POSSUI o LISTEN) tá viabilizado o ACESSO a aplicação SEM PRECISAR SUBIR o servidor

// o 1º arg é o nome da categoria//do módulo que tá testando, o 2º arg possui o código dos testes em si
describe('Transactions routes', () => {
  // OBS: O beforeAll e o afterAll DENTRO do describe faz com que eles sejam executados apenas para os testes DENTRO dessa respectiva categoria

  // Código que será executado uma única vez ANTES de TODOS os testes (se quisesse executar algo antes de CADA Teste poderia usar o beforeEach)
  // Desse modo os testes SÓ SERÃO executados quando a aplicação está  de fato pronta (se não esperar ocorrerá o erro de Not Found pq as rotas dentro dos plugins tbm são assíncronas)
  beforeAll(async () => {
    await app.ready() // a função ready tbm é uma promise irá retornar um valor quando o fastify terminar de cadastrar os plugins
  })

  // do mesmo modo tbm tem um afterEach
  afterAll(async () => {
    await app.close() // fechar a aplicação significa Removê-la da memória
  })

  beforeEach(() => {
    // com o execSync é possível passar/executar QUALQUER Comando do terminal
    execSync('npm run knex migrate:rollback --all') // desfaz todas as migrations
    execSync('npm run knex migrate:latest')

    // Fez isso para que a CADA Teste o banco seja APAGADO e dps criado novamente, isso pq entre um teste e outro pode haver conflitos
    // No entanto a depender do cenário esse procedimento tbm poderia ser feito apenas uma vez pra todos
  })

  // NOTE QUE o teste é composto de 3 Partes Importantes:
  // -> O ENUNCIADO = Descreve o que o teste se propõe a fazer
  // -> A OPERAÇÃO/Funcionalidade que será testada
  // -> A VALIDAÇÃO = Como que VERIFICA que a operação foi bem sucedida ou não [O RESULTADO do teste], trata-se do resultado ESPERADO APÓS a operação ter sido executada
  // Logo ao final de todo teste tem que ter a etapa de validação
  test('O usuário consegue criar uma nova transação', async () => {
    // no arq transactons.ts nota-se que a rota de criação manda um send vazio, ou seja NEM Há uma resposta q precise ser armazenada, apenas o status

    const response = await request(app.server).post('/transactions').send({
      title: 'Nw transaction Supertest',
      amount: 2100,
      type: 'credit',
    })
    // Por baixo de todo framework sempre existe um servidor http node "puro", como o criado usando o createServer de dentro do módulo 'node:http', a FORMA como esse server é acessado é que pode mudar a depender do framework
    // IAI o supertest sempre precisa receber ESTE Servidor do Node, iai é possível acessar os métodos http u.u

    expect(response.statusCode).toEqual(201)
  })

  test('should be able to get a specific transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Nw transaction Supertest',
        amount: 2100,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')
    console.log(cookie)

    // a única forma de obter o ID da transação é fazendo a LISTAGEM (pq é O teste tem que se ADAPTAR ao código & NÃO o código q tem q se adaptar ao teste)
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Nw transaction Supertest',
        amout: 2100,
      }),
    )
  })

  test('should be able to get the SUMMARY', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')

    await request(app.server).post('/transactions').set('Cookie', cookie).send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit',
    })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookie)
      .expect(200) // o set é o método utilizado p setar uma informação no cabeçalho da requisição

    expect(summaryResponse.body.summary).toEqual({ amout: 3000 })
  })
  test('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Nw transaction Supertest',
        amount: 2100,
        type: 'credit',
      })

    const cookie = createTransactionResponse.get('Set-Cookie')
    console.log(cookie)

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)
      .expect(200) // o set é o método utilizado p setar uma informação no cabeçalho da requisição

    console.log(listTransactionsResponse.body)

    // validar se a transaction criada neste POST Está CONTIDA no body da requisição (ou seja a listagem está retornando os dados conforme esperado)
    /* expect(listTransactionsResponse.body).toEqual([
      {
        id: expect.any(String), // TRADUZINDO: Espera que o id seja Qualquer String, isso pq o id é gerado randomicamente LÁ dentro da rota de criação (não tem como adivinhar o valor exato)
      },
    ]) */ // como apenas Um objeto foi criado então dentro do array terá apenas Um objeto com os valores dos campos conforme definido

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Nw transaction Supertest',
        amout: 2100,
      }),
    ])
  })
})
