import { db } from './db';
import { date } from 'quasar';

export class ventasDAO {
	static getInstance() {
		return new ventasDAO();
	}

	get(inicio, fin) {
		return db.ventas.where("create_at").between(inicio, fin).toArray();
	}

	save(form) {
        return db.ventas.add(form);
    }

    getOne(id) {
    	return db.ventas.get({id: id});
    }

    delete(id) {
    	return db.ventas.delete(id);
    }

    getNombre(nombre) {
    	return db.ventas.get({nombre: nombre});
    }
}