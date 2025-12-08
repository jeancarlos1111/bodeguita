import Worker from '../workers/recommendation.worker.js';

console.log("!!! RECOMMENDATION SERVICE FILE LOADED !!!");

class RecommendationService {
    constructor() {
        this.worker = null;
        this.pendingRequests = new Map();
        this.idCounter = 0;
        this.ready = false;
    }

    _generateId() {
        return ++this.idCounter;
    }

    async init() {
        if (this.ready) return;

        try {
            console.log('[RecommendationService] Initializing Worker...');
            this.worker = new Worker();

            this.worker.onmessage = (e) => {
                console.log('[RecommendationService] Message from worker:', e.data);
                const { id, type, payload } = e.data;
                
                if (type === 'ERROR') {
                    console.error('[RecommendationService] Worker Error:', payload);
                    if (this.pendingRequests.has(id)) {
                        const { reject } = this.pendingRequests.get(id);
                        reject(new Error(payload));
                        this.pendingRequests.delete(id);
                    }
                    return;
                }

                if (this.pendingRequests.has(id)) {
                    const { resolve } = this.pendingRequests.get(id);
                    resolve(payload);
                    this.pendingRequests.delete(id);
                } else {
                    console.warn('[RecommendationService] Received message with unknown or expired ID:', id);
                }
            };
            
            this.worker.onerror = (e) => {
                console.error('[RecommendationService] Worker Script Error:', e.message, 'at', e.filename, 'line', e.lineno);
            };

            // Calculate correct WASM URL from main thread context
            // process.env.BASE_URL comes from Quasar (e.g., "/bodeguita/" or "./")
            const baseUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
            const wasmUrl = new URL('bodeguita_recommendations_bg.wasm', document.baseURI || baseUrl).href;
            
            console.log('[RecommendationService] Configured WASM URL:', wasmUrl);

            // Fetch WASM bytes manually to avoid file:// protocol issues with fetch() in Worker
            const loadWasmBytes = (url) => {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = () => {
                        // status 0 is often returned for file:// success
                        if (xhr.status === 200 || (xhr.status === 0 && xhr.response)) {
                            resolve(xhr.response);
                        } else {
                            reject(new Error(`Failed to load WASM via XHR. Status: ${xhr.status}`));
                        }
                    };
                    xhr.onerror = () => reject(new Error('Network error loading WASM via XHR'));
                    xhr.send();
                });
            };

            try {
                const wasmBytes = await loadWasmBytes(wasmUrl);
                console.log(`[RecommendationService] WASM loaded as ArrayBuffer: ${wasmBytes.byteLength} bytes`);
                
                // Send configuration to worker with transferred buffer
                this.worker.postMessage({ 
                    type: 'INIT', 
                    payload: { wasmBytes } 
                }, [wasmBytes]);

            } catch (loadError) {
                console.error('[RecommendationService] Failed to load WASM bytes, falling back to URL:', loadError);
                // Fallback to URL method if XHR fails
                this.worker.postMessage({ 
                    type: 'INIT', 
                    payload: { wasmUrl } 
                });
            }

            this.ready = true;
            console.log('[RecommendationService] Worker initialized and ready.');

        } catch (error) {
            console.error('[RecommendationService] Failed to initialize worker:', error);
        }
    }

    _send(type, payload = {}) {
        if (!this.worker) this.init(); // Auto-init if not ready (though init is async, this might race, best to call init explicitly)

        return new Promise((resolve, reject) => {
            const id = this._generateId();
            this.pendingRequests.set(id, { resolve, reject });
            this.worker.postMessage({ id, type, payload });
        });
    }

    async train() {
        if (!this.ready) await this.init();
        console.log('[RecommendationService] Requesting model training...');
        return this._send('TRAIN');
    }

    async getRecommendation(currentProductId, excludedIds = []) {
        if (!this.ready) await this.init();
        return this._send('RECOMMEND', { currentProductId, excludedIds });
    }
}

export const recommendationService = new RecommendationService();
