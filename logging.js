import winston from 'winston'
import expressWinston from 'express-winston'

let logger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
  meta: true,
})

export default logger