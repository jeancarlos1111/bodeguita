import { db } from './db';
import { date } from 'quasar';

export class productosDAO {
	static getInstance() {
		return new productosDAO();
	}

	get() {
		return db.productos.toArray();
	}

	save(form) {
        return db.productos.add(form);
    }

    update(id, form) {
    	return db.productos.update(id, form);
    }

    getOne(id) {
    	return db.productos.get({id: id});
    }

    delete(id) {
    	return db.productos.delete(id);
    }

    getNombre(nombre) {
    	return db.productos.get({nombre: nombre});
    }
}