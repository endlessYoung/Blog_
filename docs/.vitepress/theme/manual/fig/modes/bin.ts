import { BIN_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import BinBoard from './BinBoard.vue'

registerBeats('bin', BIN_BEATS)
registerBoard('bin', BinBoard)
