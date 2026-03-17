<template>
  <div>
    <!-- Botón para abrir el escáner -->
    <q-btn
      v-if="!scanning"
      :flat="flat"
      :round="round"
      :dense="dense"
      :color="color"
      icon="qr_code_scanner"
      :label="round ? '' : 'Escanear'"
      :title="'Escanear código de barras / QR'"
      @click="startScanner"
    />

    <!-- Dialog del escáner -->
    <q-dialog v-model="scanning" persistent @hide="stopScanner">
      <q-card style="min-width: 320px; max-width: 480px; border-radius: 16px; overflow: hidden;">
        <q-toolbar class="bg-primary text-white">
          <q-icon name="qr_code_scanner" class="q-mr-sm" />
          <q-toolbar-title>Escanear Código</q-toolbar-title>
          <q-btn flat round dense icon="close" @click="stopScanner" />
        </q-toolbar>

        <!-- Área de video del escáner -->
        <div style="background: #000; position: relative; min-height: 240px;">
          <div id="barcode-scanner-reader" style="width: 100%;"></div>
          <!-- Overlay con línea de escaneo animada -->
          <div v-if="scannerReady" class="scanner-line" />
        </div>

        <q-card-section>
          <!-- Selector de cámara -->
          <q-select
            v-if="cameras.length > 1"
            v-model="selectedCamera"
            :options="cameras"
            label="Cámara"
            option-label="label"
            option-value="id"
            dense
            filled
            class="q-mb-sm"
            @input="switchCamera"
          />

          <!-- Resultado o estado -->
          <div v-if="lastResult" class="row items-center q-gutter-sm">
            <q-icon name="check_circle" color="positive" size="sm" />
            <span class="text-positive text-weight-bold">{{ lastResult }}</span>
          </div>
          <div v-else class="text-grey text-caption text-center q-pt-xs">
            Apunta la cámara al código de barras o QR
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancelar" color="grey" @click="stopScanner" />
          <q-btn
            v-if="lastResult"
            unelevated
            label="Usar este código"
            color="primary"
            @click="confirmCode"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

export default {
  name: 'BarcodeScanner',
  props: {
    // Props de estilo del botón disparador
    flat: { type: Boolean, default: false },
    round: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },

    // Modo: 'single' emite al primer escaneo y cierra. 'confirm' espera confirmación.
    mode: { type: String, default: 'single' }
  },
  data() {
    return {
      scanning: false,
      scannerReady: false,
      scanner: null,
      cameras: [],
      selectedCamera: null,
      lastResult: null
    }
  },
  beforeDestroy() {
    this.stopScanner();
  },
  methods: {
    async startScanner() {
      this.lastResult = null;
      this.scanning = true;

      // --- Solicitar permiso de cámara en Android (Cordova) ---
      const hasCordovaPermission = await this.requestCameraPermission();
      if (!hasCordovaPermission) {
        this.$q.notify({
          type: 'negative',
          message: 'Permiso de cámara denegado. Ve a Ajustes → Aplicaciones → Bodeguita → Permisos.'
        });
        this.scanning = false;
        return;
      }
      // --------------------------------------------------------

      await this.$nextTick();
      await this.delay(200); // Dar tiempo al dialog para renderizar

      this.scanner = new Html5Qrcode('barcode-scanner-reader');

      // Obtener cámaras disponibles
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          this.cameras = devices.map(d => ({ id: d.id, label: d.label || `Cámara ${d.id.substr(0, 6)}` }));
          // Preferir cámara trasera en móviles
          const backCam = devices.find(d => d.label && d.label.toLowerCase().includes('back'));
          this.selectedCamera = backCam
            ? { id: backCam.id, label: backCam.label }
            : { id: devices[devices.length - 1].id, label: devices[devices.length - 1].label || 'Cámara' };

          await this.launchCamera(this.selectedCamera.id);
        }
      } catch (err) {
        console.error('Error al acceder a las cámaras:', err);
        this.$q.notify({ type: 'negative', message: 'No se pudo acceder a la cámara. Verifica los permisos.' });
        this.scanning = false;
      }
    },

    // Solicita permiso de cámara en runtime cuando corre en Cordova Android
    requestCameraPermission() {
      return new Promise((resolve) => {
        // Si no es Cordova, el navegador maneja los permisos solo
        if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.permissions) {
          resolve(true);
          return;
        }

        const permissions = window.cordova.plugins.permissions;
        const CAMERA = permissions.CAMERA;

        permissions.checkPermission(CAMERA, (status) => {
          if (status.hasPermission) {
            resolve(true);
          } else {
            permissions.requestPermission(
              CAMERA,
              (newStatus) => resolve(newStatus.hasPermission),
              () => resolve(false)
            );
          }
        }, () => resolve(false));
      });
    },

    async launchCamera(cameraId) {
      try {
        await this.scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText) => {
            this.lastResult = decodedText;
            this.scannerReady = false;

            if (this.mode === 'single') {
              // Emitir inmediatamente y cerrar
              this.$emit('scanned', decodedText);
              this.stopScanner();
            }
            // En modo 'confirm', espera que el usuario presione "Usar este código"
          },
          () => { /* frame sin resultado — ignorar */ }
        );
        this.scannerReady = true;
      } catch (err) {
        console.error('Error al iniciar cámara:', err);
        this.$q.notify({ type: 'negative', message: `Error al iniciar cámara: ${err}` });
      }
    },

    async switchCamera(camera) {
      if (!this.scanner) return;
      try {
        await this.scanner.stop();
      } catch (_) {}
      this.lastResult = null;
      this.scannerReady = false;
      await this.launchCamera(camera.id);
    },

    confirmCode() {
      if (this.lastResult) {
        this.$emit('scanned', this.lastResult);
        this.stopScanner();
      }
    },

    async stopScanner() {
      this.scannerReady = false;
      if (this.scanner) {
        try {
          await this.scanner.stop();
          this.scanner.clear();
        } catch (_) {}
        this.scanner = null;
      }
      this.scanning = false;
      this.lastResult = null;
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}
</script>

<style scoped>
/* Línea animada de escaneo */
.scanner-line {
  position: absolute;
  top: 50%;
  left: 10%;
  width: 80%;
  height: 2px;
  background: rgba(0, 200, 100, 0.8);
  box-shadow: 0 0 8px rgba(0, 255, 100, 0.9);
  animation: scan 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes scan {
  0%, 100% { top: 30%; }
  50%       { top: 70%; }
}

/* Ocultar controles extra de html5-qrcode */
#barcode-scanner-reader > img,
#barcode-scanner-reader > div > select,
#barcode-scanner-reader__dashboard_section_csr,
#barcode-scanner-reader__dashboard_section_fsr,
#barcode-scanner-reader__status_span {
  display: none !important;
}

/* Centrar el video */
#barcode-scanner-reader video {
  width: 100% !important;
  max-height: 280px;
  object-fit: cover;
}
</style>
