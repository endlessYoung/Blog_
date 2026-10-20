import { CAS_FRAMES } from '../../guided'
import ManualArticleFigure from '../../ManualArticleFigure.vue'
import { registerCount, registerShell, registerStepMap } from '../registry'

registerShell('cas', ManualArticleFigure)
registerCount('cas', CAS_FRAMES.length)
registerStepMap('cas', (index) => CAS_FRAMES[index] ?? CAS_FRAMES[CAS_FRAMES.length - 1] ?? 0)
