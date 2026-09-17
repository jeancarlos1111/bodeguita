<template>
  <div :class="['barcode-scanner-root', { 'is-inline': inline }]">
    <!-- MODO IN-LINE: Embebido directamente en la pantalla de Venta (Screenshots 1 y 2) -->
    <div v-if="inline" class="scanner-inline-container">
      <div class="scanner-viewport-wrapper inline-viewport" @click="handleViewportClick">
        <!-- Contenedor donde Html5Qrcode monta el stream de video -->
        <div :id="readerId" class="html5-qrcode-element"></div>

        <!-- Marco de enfoque moderno con esquinas curvas (Screenshot 1 y 2) -->
        <div v-if="scannerReady" class="scanner-frame-modern">
          <div class="scanner-line"></div>
        </div>

        <!-- Botón flotante superior izquierdo: Linterna -->
        <div class="floating-ctrl floating-top-left" v-if="scannerReady && torchSupported">
          <q-btn
            flat
            round
            dense
            :icon="torchOn ? 'flash_on' : 'flash_off'"
            :color="torchOn ? 'amber' : 'white'"
            class="translucent-circle-btn"
            @click.stop="toggleTorch"
            :title="torchOn ? 'Apagar flash' : 'Encender flash'"
          />
        </div>

        <!-- Botones flotantes superior derecho: Alternar cámara y Cerrar -->
        <div class="floating-ctrl floating-top-right row q-gutter-xs">
          <q-btn
            v-if="scannerReady && cameras.length > 1"
            flat
            round
            dense
            icon="cameraswitch"
            color="white"
            class="translucent-circle-btn"
            @click.stop="cycleCamera"
            title="Cambiar cámara"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            class="translucent-circle-btn"
            @click.stop="$emit('close')"
            title="Ocultar escáner"
          />
        </div>

        <!-- Selector flotante de Zoom -->
        <div v-if="scannerReady && zoomSupported" class="zoom-floating-bar" @click.stop>
          <div class="zoom-pill-group">
            <button
              type="button"
              :class="['zoom-pill', { active: currentZoom === 1 }]"
              @click="setZoom(1)"
            >
              1x
            </button>
            <button
              type="button"
              :class="['zoom-pill', { active: currentZoom === 2 }]"
              @click="setZoom(2)"
            >
              2x
            </button>
            <button
              type="button"
              :class="['zoom-pill', { active: currentZoom === 3 }]"
              @click="setZoom(3)"
            >
              3x
            </button>
          </div>
        </div>

        <!-- Anillo de animación Tap-to-Focus -->
        <div
          v-if="focusRing.show"
          class="focus-ring"
          :style="{ left: `${focusRing.x}px`, top: `${focusRing.y}px` }"
        ></div>

        <!-- Overlay de carga inicial -->
        <div v-if="!scannerReady" class="scanner-loading-overlay">
          <q-spinner-dots color="white" size="44px" />
          <div class="text-caption text-white q-mt-sm">Iniciando cámara...</div>
        </div>
      </div>
    </div>

    <!-- MODO MODAL: Botón disparador + Diálogo para uso secundario -->
    <div v-else>
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

      <q-dialog v-model="scanning" persistent @hide="stopScanner">
        <q-card class="scanner-card">
          <q-toolbar class="bg-grey-10 text-white q-px-md scanner-toolbar">
            <q-icon name="qr_code_scanner" size="sm" class="text-primary q-mr-sm" />
            <q-toolbar-title class="text-subtitle1 text-weight-bold">
              Escanear Código
            </q-toolbar-title>

            <q-btn
              v-if="torchSupported"
              flat
              round
              dense
              :icon="torchOn ? 'flash_on' : 'flash_off'"
              :color="torchOn ? 'amber' : 'grey-4'"
              class="q-mr-xs"
              @click="toggleTorch"
              :title="torchOn ? 'Apagar linterna' : 'Encender linterna'"
            />

            <q-btn
              v-if="cameras.length > 1"
              flat
              round
              dense
              icon="cameraswitch"
              color="grey-4"
              class="q-mr-xs"
              @click="cycleCamera"
              title="Cambiar cámara"
            />

            <q-btn flat round dense icon="close" color="grey-4" @click="stopScanner" />
          </q-toolbar>

          <div class="scanner-viewport-wrapper" @click="handleViewportClick">
            <div :id="readerId"></div>

            <div v-if="scannerReady" class="scanner-frame-modern">
              <div class="scanner-line"></div>
            </div>

            <div
              v-if="focusRing.show"
              class="focus-ring"
              :style="{ left: `${focusRing.x}px`, top: `${focusRing.y}px` }"
            ></div>

            <div v-if="scannerReady" class="zoom-floating-bar" @click.stop>
              <div class="zoom-pill-group">
                <button
                  type="button"
                  :class="['zoom-pill', { active: currentZoom === 1 }]"
                  @click="setZoom(1)"
                >
                  1x
                </button>
                <button
                  type="button"
                  :class="['zoom-pill', { active: currentZoom === 2 }]"
                  @click="setZoom(2)"
                >
                  2x
                </button>
                <button
                  type="button"
                  :class="['zoom-pill', { active: currentZoom === 3 }]"
                  @click="setZoom(3)"
                >
                  3x
                </button>
              </div>
            </div>

            <div v-if="!scannerReady" class="scanner-loading-overlay">
              <q-spinner-dots color="primary" size="48px" />
              <div class="text-caption text-grey-4 q-mt-sm">Iniciando cámara...</div>
            </div>
          </div>

          <div class="scanner-bottom-bar q-pa-sm bg-grey-10 text-white">
            <div class="row items-center justify-between text-caption text-grey-4 q-px-xs">
              <span class="row items-center ellipsis" style="max-width: 70%;">
                <q-icon name="center_focus_strong" size="14px" class="q-mr-xs text-primary" />
                Toca el video para enfocar | Zoom para envases pequeños
              </span>
              <q-btn
                flat
                dense
                no-caps
                size="xs"
                color="primary"
                :icon="showManualInput ? 'keyboard_hide' : 'keyboard'"
                :label="showManualInput ? 'Ocultar' : 'Escribir'"
                @click="showManualInput = !showManualInput"
              />
            </div>

            <q-slide-transition>
              <div v-if="showManualInput" class="q-pt-sm q-pb-xs">
                <div class="row q-col-gutter-xs items-center">
                  <div class="col">
                    <q-input
                      v-model="manualCode"
                      dark
                      dense
                      outlined
                      color="primary"
                      bg-color="grey-9"
                      placeholder="Código de barras manual..."
                      class="manual-input"
                      @keyup.enter="confirmManualCode"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      unelevated
                      dense
                      color="primary"
                      label="Listo"
                      class="q-px-sm"
                      :disabled="!manualCode || !manualCode.trim()"
                      @click="confirmManualCode"
                    />
                  </div>
                </div>
              </div>
            </q-slide-transition>

            <div
              v-if="lastResult && mode === 'confirm'"
              class="row items-center justify-between q-mt-xs bg-grey-9 q-pa-sm rounded-borders"
            >
              <div class="row items-center text-positive text-weight-bold text-body2">
                <q-icon name="check_circle" size="sm" class="q-mr-xs" />
                <span>{{ lastResult }}</span>
              </div>
              <q-btn
                unelevated
                size="sm"
                color="primary"
                label="Usar este código"
                @click="confirmCode"
              />
            </div>

            <div class="row items-center justify-between q-pt-xs q-px-xs">
              <div class="text-caption text-grey-6">
                {{ cameras.length > 1 ? selectedCameraLabel : '' }}
              </div>
              <q-btn flat dense label="Cancelar" color="grey-4" size="sm" @click="stopScanner" />
            </div>
          </div>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default {
  name: 'BarcodeScanner',
  props: {
    // Props de estilo del botón disparador
    flat: { type: Boolean, default: false },
    round: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    color: { type: String, default: 'primary' },

    // Modo: 'single' emite al primer escaneo y cierra. 'confirm' espera confirmación. 'continuous' para scan seguido.
    mode: { type: String, default: 'single' },

    // Modo embebido / in-line para vista continua de POS
    inline: { type: Boolean, default: false },
    autoStart: { type: Boolean, default: false }
  },
  data() {
    return {
      scanning: false,
      scannerReady: false,
      scanner: null,
      cameras: [],
      selectedCamera: null,
      lastResult: null,

      // Cooldown para evitar escaneos duplicados en milisegundos
      lastScannedCode: '',
      lastScannedTime: 0,

      // Capacidades de cámara
      torchSupported: false,
      torchOn: false,
      currentZoom: 1,
      zoomSupported: false,

      // Enfoque visual (tap-to-focus)
      focusRing: {
        show: false,
        x: 0,
        y: 0
      },
      _focusTimer: null,

      // Entrada manual de código
      showManualInput: false,
      manualCode: ''
    };
  },
  computed: {
    readerId() {
      return this.inline ? 'barcode-scanner-inline-reader' : 'barcode-scanner-reader';
    },
    selectedCameraLabel() {
      if (!this.selectedCamera) return '';
      return this.selectedCamera.label || 'Cámara';
    }
  },
  mounted() {
    if (this.inline && this.autoStart) {
      this.$nextTick(() => {
        this.startScanner();
      });
    }
  },
  beforeDestroy() {
    this.stopScanner();
  },
  methods: {
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Emite un 'beep' corto y agradable mediante Web Audio API
    playBeep() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime); // Tono agradable A6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (_) {}
    },

    async startScanner() {
      if (this.scanning && this.scanner) return;

      this.lastResult = null;
      this.manualCode = '';
      this.showManualInput = false;
      this.torchOn = false;
      this.torchSupported = false;
      this.zoomSupported = false;
      this.currentZoom = 1;
      this.scanning = true;
      this.scannerReady = false;

      // Solicitar permiso de cámara en Android (Cordova si aplica)
      const hasCordovaPermission = await this.requestCameraPermission();
      if (!hasCordovaPermission) {
        this.$q.notify({
          type: 'negative',
          message: 'Permiso de cámara denegado. Ve a Ajustes → Aplicaciones → Bodeguita → Permisos.'
        });
        this.scanning = false;
        return;
      }

      await this.$nextTick();
      await this.delay(180);

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ];

      try {
        this.scanner = new Html5Qrcode(this.readerId, {
          formatsToSupport,
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        });

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          this.cameras = devices.map(d => ({
            id: d.id,
            label: d.label || `Cámara ${d.id.substr(0, 6)}`
          }));

          const backCam = devices.find(d => d.label && d.label.toLowerCase().includes('back'));
          this.selectedCamera = backCam
            ? { id: backCam.id, label: backCam.label }
            : { id: devices[devices.length - 1].id, label: devices[devices.length - 1].label || 'Cámara' };

          await this.launchCamera(this.selectedCamera.id);
        } else {
          this.$q.notify({ type: 'warning', message: 'No se detectaron cámaras en este dispositivo.' });
          this.scanning = false;
        }
      } catch (err) {
        console.error('Error al acceder a las cámaras:', err);
        this.$q.notify({ type: 'negative', message: 'No se pudo acceder a la cámara. Verifica los permisos.' });
        this.scanning = false;
      }
    },

    requestCameraPermission() {
      return new Promise((resolve) => {
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
      if (!this.scanner) return;

      const onScanSuccess = (decodedText) => {
        if (!decodedText) return;
        const code = decodedText.trim();
        const now = Date.now();

        // Evitar duplicados inmediatos del mismo código en menos de 1.8s
        if (this.lastScannedCode === code && (now - this.lastScannedTime < 1800)) {
          return;
        }
        // Debounce general de 600ms entre lecturas consecutivas
        if (now - this.lastScannedTime < 600) {
          return;
        }

        this.lastScannedCode = code;
        this.lastScannedTime = now;
        this.lastResult = code;

        // Feedback acústico y háptico
        this.playBeep();
        if (navigator.vibrate) {
          try { navigator.vibrate(60); } catch (_) {}
        }

        if (this.inline || this.mode === 'continuous') {
          this.$emit('scanned', code);
        } else if (this.mode === 'single') {
          this.scannerReady = false;
          this.$emit('scanned', code);
          this.stopScanner();
        }
      };

      const onScanFailure = () => {};

      const primaryConfig = {
        fps: 15,
        videoConstraints: {
          deviceId: { exact: cameraId },
          facingMode: 'environment',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          advanced: [{ focusMode: 'continuous' }]
        }
      };

      try {
        await this.scanner.start(cameraId, primaryConfig, onScanSuccess, onScanFailure);
        this.scannerReady = true;
        this.detectCameraCapabilities();
      } catch (err) {
        console.warn('Fallback al iniciar cámara:', err);
        try {
          await this.scanner.start(
            cameraId,
            { fps: 15 },
            onScanSuccess,
            onScanFailure
          );
          this.scannerReady = true;
          this.detectCameraCapabilities();
        } catch (fallbackErr) {
          console.error('Error definitivo al iniciar cámara:', fallbackErr);
          this.$q.notify({ type: 'negative', message: `Error al iniciar cámara: ${fallbackErr}` });
          this.scannerReady = false;
        }
      }
    },

    detectCameraCapabilities() {
      this.zoomSupported = false;
      this.torchSupported = false;

      try {
        if (this.scanner && this.scanner.getRunningTrackCameraCapabilities) {
          const cameraCaps = this.scanner.getRunningTrackCameraCapabilities();
          if (cameraCaps) {
            const zoom = cameraCaps.zoomFeature();
            if (zoom && zoom.isSupported()) {
              this.zoomSupported = true;
              this.currentZoom = zoom.value() || 1;
            }
            const torch = cameraCaps.torchFeature();
            if (torch && torch.isSupported()) {
              this.torchSupported = true;
            }
          }
        }
      } catch (_) {}

      const track = this.getMediaStreamTrack();
      if (track && track.getCapabilities) {
        try {
          const caps = track.getCapabilities();
          if (caps.zoom) this.zoomSupported = true;
          if (caps.torch) this.torchSupported = true;
        } catch (_) {}
      }
    },

    getMediaStreamTrack() {
      try {
        const video = document.querySelector(`#${this.readerId} video`);
        if (video && video.srcObject) {
          const tracks = video.srcObject.getVideoTracks();
          if (tracks && tracks.length > 0) return tracks[0];
        }
      } catch (_) {}
      return null;
    },

    async setZoom(level) {
      if (!this.scannerReady) return;
      this.currentZoom = level;

      let applied = false;
      try {
        if (this.scanner && this.scanner.applyCameraConstraints) {
          await this.scanner.applyCameraConstraints({ advanced: [{ zoom: level }] });
          applied = true;
        }
      } catch (_) {}

      if (!applied) {
        const track = this.getMediaStreamTrack();
        if (track && track.applyConstraints) {
          try {
            await track.applyConstraints({ advanced: [{ zoom: level }] });
            applied = true;
          } catch (_) {}
        }
      }

      const video = document.querySelector(`#${this.readerId} video`);
      if (video) {
        if (!applied && level > 1) {
          video.style.transform = `scale(${level})`;
        } else {
          video.style.transform = 'none';
        }
      }
    },

    async toggleTorch() {
      this.torchOn = !this.torchOn;
      let applied = false;

      try {
        if (this.scanner && this.scanner.applyCameraConstraints) {
          await this.scanner.applyCameraConstraints({ advanced: [{ torch: this.torchOn }] });
          applied = true;
        }
      } catch (_) {}

      if (!applied) {
        const track = this.getMediaStreamTrack();
        if (track && track.applyConstraints) {
          try {
            await track.applyConstraints({ advanced: [{ torch: this.torchOn }] });
          } catch (e) {
            console.warn('Error al activar linterna en track:', e);
          }
        }
      }
    },

    handleViewportClick(e) {
      if (!this.scannerReady) return;

      const rect = e.currentTarget.getBoundingClientRect();
      this.focusRing.x = e.clientX - rect.left;
      this.focusRing.y = e.clientY - rect.top;
      this.focusRing.show = true;

      clearTimeout(this._focusTimer);
      this._focusTimer = setTimeout(() => {
        this.focusRing.show = false;
      }, 1000);

      const track = this.getMediaStreamTrack();
      if (track && track.applyConstraints) {
        try {
          track.applyConstraints({
            advanced: [{ focusMode: 'continuous' }]
          }).catch(() => {});
        } catch (_) {}
      }
    },

    async cycleCamera() {
      if (this.cameras.length <= 1) return;
      const currentIndex = this.cameras.findIndex(c => c.id === this.selectedCamera.id);
      const nextIndex = (currentIndex + 1) % this.cameras.length;
      await this.switchCamera(this.cameras[nextIndex]);
    },

    async switchCamera(camera) {
      if (!this.scanner) return;
      this.selectedCamera = camera;
      this.scannerReady = false;
      this.torchOn = false;
      this.currentZoom = 1;

      try {
        await this.scanner.stop();
      } catch (_) {}

      await this.launchCamera(camera.id);
    },

    confirmManualCode() {
      if (this.manualCode && this.manualCode.trim()) {
        const code = this.manualCode.trim();
        this.$emit('scanned', code);
        this.stopScanner();
      }
    },

    confirmCode() {
      if (this.lastResult) {
        this.$emit('scanned', this.lastResult);
        this.stopScanner();
      }
    },

    async stopScanner() {
      this.scannerReady = false;
      clearTimeout(this._focusTimer);

      if (this.scanner) {
        try {
          if (this.torchOn) {
            await this.toggleTorch();
          }
          await this.scanner.stop();
          this.scanner.clear();
        } catch (_) {}
        this.scanner = null;
      }
      this.scanning = false;
      this.lastResult = null;
      this.showManualInput = false;
      this.manualCode = '';
    }
  }
};
</script>

<style scoped>
.barcode-scanner-root.is-inline {
  width: 100%;
}

.scanner-inline-container {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.scanner-card {
  width: 100vw;
  max-width: 500px;
  background: #000;
  border-radius: 18px;
  overflow: hidden;
}

.scanner-toolbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Contenedor del visor de la cámara */
.scanner-viewport-wrapper {
  position: relative;
  width: 100%;
  min-height: 260px;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: crosshair;
}

.inline-viewport {
  height: 270px;
  border-radius: 20px;
}

/* Spinner de carga inicial */
.scanner-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #050505;
  z-index: 10;
}

/* Marco moderno de enfoque redondeado (Screenshots 1 y 2) */
.scanner-frame-modern {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 76%;
  height: 64%;
  border: 2px solid rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.38);
  pointer-events: none;
  z-index: 5;
}

/* Línea animada de escaneo */
.scanner-line {
  position: absolute;
  top: 15%;
  left: 4%;
  width: 92%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10B981, #A7F3D0, #10B981, transparent);
  box-shadow: 0 0 8px #10B981;
  animation: laserScan 2.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes laserScan {
  0% { top: 12%; opacity: 0.6; }
  50% { top: 88%; opacity: 1; }
  100% { top: 12%; opacity: 0.6; }
}

/* Controles flotantes circulares translúcidos */
.floating-ctrl {
  position: absolute;
  top: 12px;
  z-index: 10;
}

.floating-top-left {
  left: 12px;
}

.floating-top-right {
  right: 12px;
}

.translucent-circle-btn {
  background: rgba(15, 23, 42, 0.55) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

/* Anillo Tap-to-Focus */
.focus-ring {
  position: absolute;
  width: 50px;
  height: 50px;
  margin-left: -25px;
  margin-top: -25px;
  border: 2px solid #10B981;
  border-radius: 50%;
  pointer-events: none;
  animation: focusPulse 0.9s ease-out forwards;
  z-index: 12;
}

@keyframes focusPulse {
  0% { transform: scale(1.6); opacity: 0.2; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0; }
}

/* Botones flotantes de Zoom */
.zoom-floating-bar {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 8;
}

.zoom-pill-group {
  display: flex;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 3px;
  gap: 4px;
}

.zoom-pill {
  border: none;
  background: transparent;
  color: #cfd8dc;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-pill.active {
  background: #0D684F;
  color: #fff;
}

.scanner-bottom-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>

<!-- Estilos no scoped para DOM de video inyectado por html5-qrcode -->
<style>
#barcode-scanner-reader,
#barcode-scanner-inline-reader {
  width: 100% !important;
  border: none !important;
}

#barcode-scanner-reader video,
#barcode-scanner-inline-reader video {
  width: 100% !important;
  height: 100% !important;
  min-height: 260px !important;
  object-fit: cover !important;
  display: block !important;
  transition: transform 0.2s ease-out;
}

#barcode-scanner-reader > img,
#barcode-scanner-inline-reader > img,
#barcode-scanner-reader > div > select,
#barcode-scanner-inline-reader > div > select,
#barcode-scanner-reader__dashboard_section_csr,
#barcode-scanner-inline-reader__dashboard_section_csr,
#barcode-scanner-reader__dashboard_section_fsr,
#barcode-scanner-inline-reader__dashboard_section_fsr,
#barcode-scanner-reader__status_span,
#barcode-scanner-inline-reader__status_span,
#barcode-scanner-reader__header_message,
#barcode-scanner-inline-reader__header_message {
  display: none !important;
}
</style>
