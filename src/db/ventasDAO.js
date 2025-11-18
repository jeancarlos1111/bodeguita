import { db } from './db';
import { date } from 'quasar';

export class ventasDAO {
	static getInstance() {
		return new ventasDAO();
	}

	get(inicio, fin) {
		// Asegurar que el rango incluya todo el día
		// Si las fechas no incluyen hora, agregar el rango completo del día
		const inicioCompleto = inicio && inicio.includes(' ') ? inicio : `${inicio} 00:00:00`;
		const finCompleto = fin && fin.includes(' ') ? fin : `${fin} 23:59:59`;

		console.log("ventasDAO.get - Fechas recibidas:", inicio, fin);
		console.log("ventasDAO.get - Fechas completas:", inicioCompleto, finCompleto);

		// Usar between con límites inclusivos
		return db.ventas
			.where("create_at")
			.between(inicioCompleto, finCompleto, true, true)
			.toArray()
			.then(result => {
				console.log("ventasDAO.get - Resultados encontrados:", result.length);
				return result;
			});
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
