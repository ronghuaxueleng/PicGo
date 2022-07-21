import router from './router'
import {
  handleResponse
} from './utils'
import path from 'path'
import { dbPathDir } from 'apis/core/datastore/dbChecker'
const STORE_PATH = dbPathDir()
path.join(STORE_PATH, 'picgo.log')
router.post('/heartbeat', async ({
  response
} : {
  response: IHttpResponse,
}) => {
  handleResponse({
    response,
    body: {
      success: true,
      result: 'alive'
    }
  })
})

export default router
