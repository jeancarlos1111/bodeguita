<template>
    <q-page class="q-pa-md ">
        <div class="text-h5 text-primary text-weight-bold q-mb-md">Configuración</div>

        <div class="row q-col-gutter-md">
            <!-- Section 1: Business Data -->
            <div class="col-12 col-md-6">
                <q-card class="rounded-card shadow-1">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold q-mb-sm">Datos del Negocio</div>
                        <div class="text-caption text-grey q-mb-md">Información que aparecerá en el Reporte Z y Facturas
                        </div>

                        <q-form @submit="saveBusinessData" class="q-gutter-y-md">
                            <q-input filled v-model="negocio.nombre" label="Nombre del Negocio"
                                :rules="[val => !!val || 'Requerido']" />
                            <q-input filled v-model="negocio.rif" label="RIF / NIT"
                                :rules="[val => !!val || 'Requerido']" mask="A-###########" unmasked-value />
                            <q-input filled v-model="negocio.direccion" label="Dirección Fiscal" type="textarea"
                                rows="3" />

                            <div class="text-right">
                                <q-btn label="Guardar Datos" type="submit" color="primary" unelevated
                                    :loading="loading" />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Section 2: Invoice Sequence -->
            <div class="col-12 col-md-6">
                <q-card class="rounded-card shadow-1 q-mb-md">
                    <q-card-section>
                        <div class="row items-center justify-between">
                            <div class="text-subtitle1 text-weight-bold">Secuencia de Facturación</div>
                            <q-icon name="lock" color="negative" v-if="secuenciaBloqueada" size="sm">
                                <q-tooltip>Secuencia Bloqueada</q-tooltip>
                            </q-icon>
                        </div>
                        <div class="text-caption text-grey q-mb-md">
                            Establece el número inicial del talonario. <br>
                            <span class="text-negative text-weight-bold" v-if="!secuenciaBloqueada">¡ATENCIÓN! Una vez
                                guardado, no se podrá modificar.</span>
                            <span v-else class="text-positive">La secuencia está activa y segura.</span>
                        </div>

                        <q-form @submit="saveSequence" class="q-gutter-y-md">
                            <q-input filled v-model.number="secuencia" type="number" label="Número Actual / Inicial"
                                :disable="secuenciaBloqueada" :rules="[
                                    val => val > 0 || 'Debe ser mayor a 0',
                                    val => Number.isInteger(val) || 'Debe ser entero'
                                ]" />

                            <div class="text-right" v-if="!secuenciaBloqueada">
                                <q-btn label="Establecer y Bloquear" type="submit" color="negative" outline
                                    :loading="loading" />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>

                <!-- Section 3: Tributos (New) -->
                <q-card class="rounded-card shadow-1">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Tributos e Impuestos</div>
                        <div class="text-caption text-grey q-mb-md">
                            Configura si deseas desglosar impuestos en las ventas.
                        </div>

                        <q-list>
                            <q-item tag="label" v-ripple>
                                <q-item-section>
                                    <q-item-label>Cobrar IVA</q-item-label>
                                    <q-item-label caption>Calcula y desglosa el impuesto en cada venta</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-toggle color="primary" v-model="tributos.cobrar_iva" @input="saveTributos" />
                                </q-item-section>
                            </q-item>

                            <q-item tag="label" v-ripple>
                                <q-item-section>
                                    <q-item-label>Cobrar IGTF (3%)</q-item-label>
                                    <q-item-label caption>Aplica recargo a pagos en divisas</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-toggle color="primary" v-model="tributos.cobrar_igtf" @input="saveTributos" />
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>

                <!-- Section 4: Recomendaciones -->
                <q-card class="rounded-card shadow-1 q-mt-md">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Sugerencias y Recomendaciones</div>
                        <div class="text-caption text-grey q-mb-md">
                            Configura si deseas mostrar sugerencias de productos al realizar ventas.
                        </div>

                        <q-list>
                            <q-item tag="label" v-ripple>
                                <q-item-section>
                                    <q-item-label>Sugerencias Activas</q-item-label>
                                    <q-item-label caption>Mostrar "Clientes también llevan" al agregar productos al carrito</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-toggle color="primary" v-model="sugerencias_activas" @input="saveSugerencias" />
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-card-section>
                </q-card>

                <!-- Section 5: Backup & Restore -->
                <q-card class="rounded-card shadow-1 q-mt-md">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Base de Datos (Respaldo)</div>
                        <div class="text-caption text-grey q-mb-md">
                            Descarga un respaldo de tus datos o restaura una copia previa.
                        </div>
                        <div class="row q-col-gutter-sm">
                            <div class="col-12 col-sm-6">
                                <q-btn label="Descargar Respaldo" icon="download" color="primary" class="full-width" outline
                                    @click="backupData" />
                            </div>
                            <div class="col-12 col-sm-6">
                                <q-btn label="Restaurar Datos" icon="upload" color="negative" class="full-width" outline
                                    @click="triggerRestore" />
                                <input type="file" ref="restoreInput" style="display: none" accept=".json"
                                    @change="restoreData" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script>
import { configuracionDAO } from '../db/configuracionDAO';
import { exportDatabase, importDatabase } from '../db/db';

export default {
    name: 'Configuracion',
    data() {
        return {
            negocio: {
                nombre: '',
                rif: '',
                direccion: ''
            },
            secuencia: null,
            secuenciaBloqueada: false,
            loading: false,
            tributos: {
                cobrar_iva: false,
                cobrar_igtf: false
            },
            sugerencias_activas: true
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        async loadData() {
            this.loading = true;
            try {
                // Business Data
                const datos = await configuracionDAO.getInstance().get('datos_negocio');
                if (datos) {
                    this.negocio = { ...datos };
                }

                // Sequence
                const seq = await configuracionDAO.getInstance().get('secuencia_factura');
                if (seq) this.secuencia = seq;

                const locked = await configuracionDAO.getInstance().get('secuencia_bloqueada');
                this.secuenciaBloqueada = !!locked;

                // Tributos (Taxes)
                const taxes = await configuracionDAO.getInstance().get('tributos');
                if (taxes) {
                    this.tributos = { ...taxes };
                }

                // Recomendaciones
                const sug = await configuracionDAO.getInstance().get('sugerencias_activas');
                if (sug !== null) {
                    this.sugerencias_activas = sug;
                }
            } catch (e) {
                console.error(e);
                this.$q.notify({ type: 'negative', message: 'Error cargando configuración' });
            } finally {
                this.loading = false;
            }
        },
        async saveBusinessData() {
            this.loading = true;
            try {
                await configuracionDAO.getInstance().save('datos_negocio', this.negocio);
                this.$q.notify({ type: 'positive', message: 'Datos del negocio guardados' });
            } catch (e) {
                this.$q.notify({ type: 'negative', message: 'Error guardando datos' });
            } finally {
                this.loading = false;
            }
        },
        saveSequence() {
            this.$q.dialog({
                title: 'Confirmar Seguridad',
                message: '¿Estás seguro de establecer este número? <b>No podrás editarlo después</b> para garantizar la consecutividad.',
                html: true,
                cancel: true,
                persistent: true
            }).onOk(async () => {
                this.loading = true;
                try {
                    await configuracionDAO.getInstance().save('secuencia_factura', Number(this.secuencia));
                    await configuracionDAO.getInstance().save('secuencia_bloqueada', true);
                    this.secuenciaBloqueada = true;
                    this.$q.notify({ type: 'positive', message: 'Secuencia establecida correctamente' });
                } catch (e) {
                    this.$q.notify({ type: 'negative', message: 'Error guardando secuencia' });
                } finally {
                    this.loading = false;
                }
            })
        },
        async saveTributos() {
            try {
                await configuracionDAO.getInstance().save('tributos', this.tributos);
                // Silent save or small notification
                this.$q.notify({
                    type: 'positive',
                    message: 'Configuración de tributos actualizada',
                    timeout: 1000
                });
            } catch (e) {
                console.error(e);
                this.$q.notify({ type: 'negative', message: 'Error guardando tributos' });
            }
        },
        async saveSugerencias() {
            try {
                await configuracionDAO.getInstance().save('sugerencias_activas', this.sugerencias_activas);
                this.$q.notify({
                    type: 'positive',
                    message: 'Configuración de sugerencias actualizada',
                    timeout: 1000
                });
            } catch (e) {
                console.error(e);
                this.$q.notify({ type: 'negative', message: 'Error guardando configuración de sugerencias' });
            }
        },
        async backupData() {
            try {
                const data = await exportDatabase();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bodeguita_backup_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                this.$q.notify({ type: 'positive', message: 'Respaldo generado con éxito' });
            } catch (e) {
                console.error(e);
                this.$q.notify({ type: 'negative', message: 'Error al generar respaldo' });
            }
        },
        triggerRestore() {
            this.$refs.restoreInput.click();
        },
        async restoreData(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.$q.dialog({
                title: '¡ADVERTENCIA CRÍTICA!',
                message: 'Esta acción <b>SOBRESCRIBIRÁ</b> todos los datos actuales de la aplicación con la información del archivo. No se puede deshacer.<br><br>¿Deseas continuar?',
                html: true,
                cancel: true,
                persistent: true,
                ok: { label: 'Restaurar Todo', color: 'negative', unelevated: true }
            }).onOk(async () => {
                this.$q.loading.show({ message: 'Restaurando base de datos...' });
                try {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            await importDatabase(e.target.result);
                            this.$q.loading.hide();
                            this.$q.notify({ type: 'positive', message: 'Datos restaurados con éxito. Reiniciando...' });
                            setTimeout(() => window.location.reload(), 1500);
                        } catch (err) {
                            this.$q.loading.hide();
                            this.$q.notify({ type: 'negative', message: 'Archivo de respaldo inválido' });
                        }
                    };
                    reader.readAsText(file);
                } catch (e) {
                    this.$q.loading.hide();
                    this.$q.notify({ type: 'negative', message: 'Error al leer el archivo' });
                }
            }).onCancel(() => {
                event.target.value = ''; // Reset input
            });
        }
    }
}
</script>

<style scoped>
.rounded-card {
    border-radius: 16px;
}
</style>
