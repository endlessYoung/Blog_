import { GC_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import GcBoard from './GcBoard.vue'

registerBeats('gc', GC_BEATS)
registerBoard('gc', GcBoard)
