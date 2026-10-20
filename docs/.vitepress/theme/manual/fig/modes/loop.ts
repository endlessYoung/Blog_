import { LOOP_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import LoopBoard from './LoopBoard.vue'

registerBeats('loop', LOOP_BEATS)
registerBoard('loop', LoopBoard)
