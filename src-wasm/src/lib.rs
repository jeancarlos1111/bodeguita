use wasm_bindgen::prelude::*;
use std::collections::HashMap;

// Habilitar el hook de errores de consola para mejor debugging (opcional)
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn train_model_wasm(flat_products: &[i32], sale_lengths: &[i32]) -> String {
    // flat_products: Array plano con todos los IDs de productos de todas las ventas
    // sale_lengths: Array con la cantidad de productos por cada venta (para saber dónde cortar)
    
    let mut matrix: HashMap<i32, HashMap<i32, u32>> = HashMap::new();
    let mut offset = 0;
    
    for &length in sale_lengths {
        let len = length as usize;
        if len < 2 {
            offset += len;
            continue;
        }

        let end = offset + len;
        
        // Obtenemos el slice que corresponde a UNA venta
        // Verificamos limites para evitar panic
        if end > flat_products.len() {
            break;
        }
        
        let sale = &flat_products[offset..end];
        
        // Doble bucle optimizado en bajo nivel
        for i in 0..len {
            for j in 0..len {
                if i == j { continue; }
                
                let p_a = sale[i];
                let p_b = sale[j];
                
                let row = matrix.entry(p_a).or_insert_with(HashMap::new);
                let count = row.entry(p_b).or_insert(0);
                *count += 1;
            }
        }
        
        offset = end;
    }
    
    // Serializamos la matriz a JSON para devolverla a JS
    // Usamos unwrap() porque sabemos que el HashMap es serializable seguro
    serde_json::to_string(&matrix).unwrap_or_else(|_| "{}".to_string())
}
