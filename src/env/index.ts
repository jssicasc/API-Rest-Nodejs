import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' }) // determina o path do arquivo q tem as variáveis para o ambiente de TESTE da aplicação
} else {
  config() // quando NÃO passa o parâmetro por default já busca as variáveis ambiente no arquivo .env
}

// o z serve p criar o schema q é um FORMATO De Dado, então dentro de envSchema deve ser definido o formato que os dados de process.env (variáveis ambiente) devem ter
// NOTE-QUE a definição NÃO É feita PARA CADA VarAmbiente Mas Sim Para TODAS, até pq process.env é um objeto (por isso o uso de z.object)
// Além disso por padrão o campo definido em z é obrigatório, se fosse opcional poderia adicionar o .nullable() no fim do tipo ex[DATABASE_URL: z.string().nullable()]
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']), // usou o nome 'pg' pq foi assim q o KNEX NOMEOU o cliente do postgres
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3333), // caso o valor convertido pelo coerce não retornar um número válido então a porta fica definida como 3333
})

// NOTE-TBM-QUE apesar do arq .env Não Possuir a variável PORT a aplicação será executada sem erros pq foi definido um valor default p ela (como se ela ñ fosse obrigatória)
// O NODE_ENV tbm foi adicionado pq nem sempre as ferramentas utilizadas informam

const _env = envSchema.safeParse(process.env)
// ao passar os dados de process.env dentro do parse isso faz com que o zod REALIZE a VALIDAÇÃO, ouseja vai dentro de process.env, confere se existe o DATABASE_URL e se é do tipo definido
// o safeParse terá funcionamento semelhante ao Parse, a DIFERENÇA é q ele NÃO vai DISPARAR o erro (THROW)
// MAS se tudo der certo então este código continuará sendo executado

if (_env.success === false) {
  console.error('⨶ Invalid environment variables! ', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
// IAI nos outros arqs em vez de acessar utilizando process.env Basta importar e acessar usando esse env q as tratativas de erro serão executadas
