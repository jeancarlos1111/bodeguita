import { formatMoney, formatMoneyUSD, formatDateTime, formatDate } from '../utils/format';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { date } from 'quasar';

import Vue from 'vue';

export const globalStore = Vue.observable({
    valor_dolar: 0
});

export const getDolar = async () => {
    try {
        const result = await valor_dolarDAO.getUltimo();
        if (result) {
            globalStore.valor_dolar = result.valor_dolar;
            return result.valor_dolar;
        }
        return 0;
    } catch (e) {
        console.error("Error al obtener valor del dolar global:", e);
        return 0;
    }
};

export default async ({ Vue }) => {
    Vue.prototype.$formatMoney = formatMoney;
    Vue.prototype.$formatMoneyUSD = formatMoneyUSD;
    Vue.prototype.$formatDateTime = formatDateTime;
    Vue.prototype.$formatDate = formatDate;
    Vue.prototype.$getFechaCreacion = () => date.formatDate(Date.now(), 'YYYY/MM/DD HH:mm:ss');
    Vue.prototype.$getHoyFecha = () => date.formatDate(Date.now(), 'YYYY/MM/DD');
    Vue.prototype.$getDolar = getDolar;

    Object.defineProperty(Vue.prototype, '$valor_dolar', {
        get() { return globalStore.valor_dolar; }
    });
};
