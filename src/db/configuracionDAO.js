import { db } from './db';

export class configuracionDAO {
	static getInstance() {
		return new configuracionDAO();
	}

	async get(key) {
		const result = await db.configuracion.get(key);
		return result ? result.value : null;
	}

	async save(key, value) {
        return db.configuracion.put({ key, value });
    }
}
