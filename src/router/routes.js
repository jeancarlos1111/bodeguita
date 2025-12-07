
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/productos', component: () => import('pages/Productos.vue') },
      { path: '/ventas', component: () => import('pages/Ventas.vue') },
      { path: '/ventas-por-producto', component: () => import('pages/VentasPorProducto.vue') },
      { path: '/kardex', component: () => import('pages/Kardex.vue') },
      { path: '/valor_dolar', component: () => import('pages/ValorDolar.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
