import { formatMoney, formatMoneyUSD, formatDateTime, formatDate } from '../utils/format';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { date } from 'quasar';

export default async ({ Vue }) => {
    Vue.mixin({
        data() {
            return {
                m_valor_dolar: 0
            }
        },
        computed: {
            m_fechaCreacion() {
                return date.formatDate(Date.now(), 'YYYY/MM/DD HH:mm:ss');
            },
            m_hoyFecha() {
                return date.formatDate(Date.now(), 'YYYY/MM/DD');
            }
        },
        methods: {
            m_formatMoney(val) {
                return formatMoney(val);
            },
            m_formatMoneyUSD(val) {
                return formatMoneyUSD(val);
            },
            m_formatDateTime(val) {
                return formatDateTime(val);
            },
            m_formatDate(val) {
                return formatDate(val);
            },
            async m_getDolar() {
                try {
                    const result = await valor_dolarDAO.getInstance().getUltimo();
                    if (result) {
                        this.m_valor_dolar = result.valor_dolar;
                        return result.valor_dolar;
                    }
                    return 0;
                } catch (e) {
                    console.error("Error al obtener valor del dolar global:", e);
                    return 0;
                }
            }
        }
    });
};
