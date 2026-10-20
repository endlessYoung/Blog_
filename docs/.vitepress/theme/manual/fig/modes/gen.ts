import { GEN_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import GenBoard from './GenBoard.vue'

registerBeats('gen', GEN_BEATS)
registerBoard('gen', GenBoard)
