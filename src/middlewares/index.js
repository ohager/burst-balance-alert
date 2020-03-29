import cors from 'cors'
import {auth} from './basic-auth'

export default [
    cors(),
    auth
]
