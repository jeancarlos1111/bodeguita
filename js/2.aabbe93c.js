(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[2],{"404a":function(t,e,a){"use strict";a.d(e,"a",(function(){return r}));var o=a("4204");a("bd4c");class r{static getInstance(){return new r}get(t,e){return o["a"].ventas.where("create_at").between(t,e).toArray()}save(t){return o["a"].ventas.add(t)}getOne(t){return o["a"].ventas.get({id:t})}delete(t){return o["a"].ventas.delete(t)}getNombre(t){return o["a"].ventas.get({nombre:t})}}},4204:function(t,e,a){"use strict";a.d(e,"a",(function(){return s}));var o=a("4dec"),r=a("c056");const s=new o["a"]("BODEGUITA");s.version(1).stores({valores_dolar:"++id, valor, create_at, update_at",productos:"++id, &nombre, valor, create_at, update_at",ventas:"++id, total, *productos, create_at, update_at"}),s.version(2).stores({valores_dolar:"++id, valor, create_at, update_at",productos:"++id, &nombre, valor, create_at, update_at, cantidad"}),s.open().catch((function(t){console.error("Fallo al abrir la base de datos: "+(t.stack||t))})),s.valores_dolar.mapToClass(r["a"])},"45e8":function(t,e,a){"use strict";a.d(e,"a",(function(){return r}));var o=a("4204");a("bd4c");class r{static getInstance(){return new r}get(){return o["a"].productos.toArray()}save(t){return o["a"].productos.add(t)}update(t,e){return o["a"].productos.update(t,e)}getOne(t){return o["a"].productos.get({id:t})}delete(t){return o["a"].productos.delete(t)}getNombre(t){return o["a"].productos.get({nombre:t})}}},"8b24":function(t,e,a){"use strict";a.r(e);var o=function(){var t=this,e=t._self._c;return e("q-page",{staticClass:"bg-grey-3 q-pa-md",attrs:{padding:""}},[e("div",{staticClass:"row"},[e("q-select",{staticClass:"col q-mr-sm",staticStyle:{width:"250px","padding-bottom":"32px"},attrs:{label:"Producto",color:"teal",autofocus:"",filled:"","use-input":"","hide-selected":"","fill-input":"","input-debounce":"0",options:t.options},on:{filter:t.filterFn},scopedSlots:t._u([{key:"no-option",fn:function(){return[e("q-item",[e("q-item-section",{staticClass:"text-grey"},[t._v("\n            Sin resultados\n          ")])],1)]},proxy:!0}]),model:{value:t.producto,callback:function(e){t.producto=e},expression:"producto"}}),e("q-input",{staticClass:"col",attrs:{color:"teal",filled:"",type:"number",label:"Cantidad"},scopedSlots:t._u([{key:"append",fn:function(){return[e("q-icon",{attrs:{name:"add_shopping_cart",color:"teal"},on:{click:t.agregarListaCompra}})]},proxy:!0}]),model:{value:t.cantidad,callback:function(e){t.cantidad=t._n(e)},expression:"cantidad"}}),e("q-btn",{staticClass:"full-width q-mb-md",attrs:{color:"teal",label:"Agregar",icon:"add_shopping_cart"},on:{click:t.agregarListaCompra}})],1),e("div",{staticClass:"row"},[e("q-banner",{staticClass:"col text-white bg-red",attrs:{"inline-actions":""},scopedSlots:t._u([{key:"action",fn:function(){return[e("q-btn",{attrs:{flat:"",color:"white",label:"Pagar",icon:"paid"},on:{click:t.save}})]},proxy:!0}])},[t._v("\n    Bs "+t._s(new Intl.NumberFormat("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t.total))+"\n    ")])],1),e("q-list",{staticClass:"bg-white",attrs:{bordered:"",padding:""}},[e("q-item-label",{attrs:{header:""}},[t._v("Listado")]),t._l(t.lista_compras,(function(a,o){return e("q-item",{directives:[{name:"ripple",rawName:"v-ripple"}],key:o},[e("q-item-section",{attrs:{side:""}},[t._v("\n        "+t._s(new Intl.NumberFormat("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(a.valor_bs))+"\n      ")]),e("q-item-section",[e("q-item-label",[t._v(t._s(a.cantidad))])],1),e("q-item-section",[e("q-item-label",[t._v(t._s(a.existencia))])],1),e("q-item-section",[e("q-item-label",[t._v(t._s(a.producto))])],1),e("q-item-section",{attrs:{side:""}},[e("q-btn",{attrs:{flat:"",round:"",color:"negative",icon:"delete"},on:{click:function(e){return t.eliminarProductoLista(o)}}},[e("q-tooltip",{attrs:{"transition-show":"rotate","transition-hide":"rotate"}},[t._v("\n              Eliminar registro selecionado\n            ")])],1)],1)],1)}))],2)],1)},r=[],s=a("bd4c"),i=a("45e8"),n=a("e633"),c=a("404a"),l=a("ed9b1"),d=a("4204"),u={name:"PageIndex",data(){return{valor_dolar:null,lista_compras:[],form:new l["a"],total:0,cantidad:1,producto:null,options:[],stringOptions:[]}},computed:{hoyDate(){let t=Date.now();return s["b"].formatDate(t,"dddd D MMMM hh:mm A")},fechaCreacion(){let t=Date.now();return s["b"].formatDate(t,"YYYY/MM/DD HH:mm:ss")}},mounted(){this.getProdutos(),this.getDolar()},methods:{getProdutos(){i["a"].getInstance().get().then((t=>{t.forEach((t=>this.stringOptions.push(t.nombre)))}))},getDolar(){n["a"].getInstance().getUltimo().then((t=>{this.valor_dolar=t.valor_dolar}))},agregarListaCompra(){let t=this.producto;t?(this.$q.loading.show(),i["a"].getInstance().getNombre(t).then((t=>{this.$q.loading.hide();let e=Number(t.valor)*Number(this.valor_dolar)*Number(this.cantidad);this.lista_compras.push({id:t.id,producto:t.nombre,valor_bs:e,cantidad:this.cantidad,valor_dolar:this.valor_dolar,existencia:t.cantidad}),this.total=this.total+e,this.producto=null}))):this.$q.notify({position:"top",type:"negative",message:"Debe agregar un producto a la lista"})},save(){this.$q.loading.show(),this.form.create_at=this.fechaCreacion,this.form.total=this.total,this.form.productos=this.lista_compras,c["a"].getInstance().save(this.form).then((()=>{this.lista_compras.forEach((t=>{d["a"].productos.get(t.id).then((function(e){let a=e.cantidad-t.cantidad;d["a"].productos.update(t.id,{cantidad:a})}))})),this.form=new l["a"],this.lista_compras=[],this.total=0,this.$q.loading.hide(),this.$q.notify({position:"top",type:"positive",message:"Datos guardados."})})).catch((function(t){console.error(`Error: ${t.stack}`),this.$q.notify({position:"top",type:"negative",message:`Error: ${t.stack}`})}))},eliminarProductoLista(t){console.log(t);let e=this.lista_compras[t];this.lista_compras.splice(t,1),this.total=this.total-e.valor_bs},filterFn(t,e,a){t.length<2?a():e((()=>{const e=t.toLowerCase();this.options=this.stringOptions.filter((t=>t.toLowerCase().indexOf(e)>-1))}))}}},p=u,m=a("2877"),g=a("9989"),h=a("ddd8"),v=a("66e5"),_=a("4074"),f=a("27f9"),b=a("0016"),q=a("9c40"),w=a("54e1"),y=a("1c1c"),C=a("0170"),D=a("05c0"),x=a("714f"),I=a("eebe"),k=a.n(I),Q=Object(m["a"])(p,o,r,!1,null,null,null);e["default"]=Q.exports;k()(Q,"components",{QPage:g["a"],QSelect:h["a"],QItem:v["a"],QItemSection:_["a"],QInput:f["a"],QIcon:b["a"],QBtn:q["a"],QBanner:w["a"],QList:y["a"],QItemLabel:C["a"],QTooltip:D["a"]}),k()(Q,"directives",{Ripple:x["a"]})},c056:function(t,e,a){"use strict";a.d(e,"a",(function(){return o}));class o{}},e633:function(t,e,a){"use strict";a.d(e,"a",(function(){return r}));var o=a("4204");a("bd4c");class r{static getInstance(){return new r}get(){return o["a"].valores_dolar.toArray()}save(t){return o["a"].valores_dolar.add(t)}getOne(t){return o["a"].valores_dolar.get({id:t})}delete(t){return o["a"].valores_dolar.delete(t)}getUltimo(){return o["a"].valores_dolar.orderBy("create_at").reverse().limit(1).first()}}},ed9b1:function(t,e,a){"use strict";a.d(e,"a",(function(){return o}));class o{}}}]);