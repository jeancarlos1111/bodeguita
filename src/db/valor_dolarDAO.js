import { db } from './db';
import { date } from 'quasar';

export class valor_dolarDAO {
	static getInstance() {
		return new valor_dolarDAO();
	}

	get() {
		return db.valores_dolar.toArray();
	}

	save(form) {
        return db.valores_dolar.add(form);
    }

    getOne(id) {
    	return db.valores_dolar.get({id: id});
    }

    delete(id) {
    	return db.valores_dolar.delete(id);
    }

    getUltimo() {
    	return db.valores_dolar.orderBy("create_at").reverse().limit(1).first();
    }
}