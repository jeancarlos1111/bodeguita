import { date } from 'quasar';

/**
 * Formatea un monto a moneda de Venezuela (Bolívares)
 * @param {number} amount 
 * @returns {string}
 */
export const formatMoney = (amount) => {
    return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

/**
 * Formatea un monto a moneda de Estados Unidos (Dólares)
 * @param {number} amount 
 * @returns {string}
 */
export const formatMoneyUSD = (amount) => {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

/**
 * Formatea un timestamp a formato legible DD/MM/YYYY hh:mm A
 * @param {number|string|Date} val 
 * @returns {string}
 */
export const formatDateTime = (val) => {
    if (!val) return '';
    return date.formatDate(val, 'DD/MM/YYYY hh:mm A');
};

/**
 * Formatea un timestamp a formato solo fecha DD/MM/YYYY
 * @param {number|string|Date} val 
 * @returns {string}
 */
export const formatDate = (val) => {
    if (!val) return '';
    return date.formatDate(val, 'DD/MM/YYYY');
};
