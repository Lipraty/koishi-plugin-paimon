import { Context } from '@koishijs/client'
import Page from './page.vue'

export default (ctx: Context) => {
  ctx.page({
    name: 'Paimon',
    path: '/paimon',
    component: Page,
  })
}
