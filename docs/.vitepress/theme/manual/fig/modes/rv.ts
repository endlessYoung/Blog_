import { RV_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import RvBoard from './RvBoard.vue'

registerBeats('rv', RV_BEATS)
registerBoard('rv', RvBoard)
