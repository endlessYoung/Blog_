import { GLIDE_BEATS } from '../../guided'
import { registerBeats, registerBoard } from '../registry'
import GlideBoard from './GlideBoard.vue'

registerBeats('glide', GLIDE_BEATS)
registerBoard('glide', GlideBoard)
