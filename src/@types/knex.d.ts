// eslint-disable-next-line
import { Knex } from 'knex'

// A interface tables definida neste caminho seria p ajudar a mapear as tables do BD, no entanto esse mapeamento ñ é feito automaticamente
// A partir do momento q a tabela é definida na interface Tables o VS Code já consegue identificá-la, iai confiando nas sugestões só fica possível selecionar uma tabela que já exista
// LEMBRANDO QUE a ? indica q o campo é OPCIONAL
declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amout: number
      created_at: string
      session_id?: string
    }
  }
}
