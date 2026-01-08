import { db } from './db';

export class clientesDAO {
    static getInstance() {
        return new clientesDAO();
    }

    get() {
        return db.clientes.toArray();
    }

    save(form) {
        return db.clientes.add(form);
    }
    
    update(id, form) {
        return db.clientes.update(id, form);
    }

    delete(id) {
        return db.clientes.delete(id);
    }
    
    getByCedula(cedula) {
        return db.clientes.get({cedula: cedula});
    }
}
