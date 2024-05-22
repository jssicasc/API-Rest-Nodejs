import { app } from './app'
import { env } from './env'

// faz com q a aplicação escute a porta definida, e o listen é uma promise por isso o .then() será executado quando essa promise terminar de ser executada
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server is Running ;p')
  })
