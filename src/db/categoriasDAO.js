import { db } from './db';

export const categoriasDAO = {

    get() {
        return db.categorias.toArray();
    },

    save(form) {
        return db.categorias.add(form);
    },

    delete(id) {
        return db.categorias.delete(id);
    },

    getNombre(nombre) {
        return db.categorias.get({ nombre: nombre });
    }
};
