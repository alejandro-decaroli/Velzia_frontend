<script lang="ts">
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte";
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';

    let error: string | null = null;
    let loading = true;

    // Datos base
    let ventasPendientes: any[] = [];
    let pedidosPendientes: any[] = [];
    let costosPendientes: any[] = [];
    let cajas: any[] = [];

    // Filtros de tiempo
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    let modoPeriodo: 'historico' | 'mes' = 'historico';
    let selectedMes: string = currentMonthStr;

    // Pestaña de desglose
    let activeTab: 'entradas' | 'salidas' | 'cajas' = 'entradas';

    // Parámetros de Simulación de Escenarios (What-If)
    let tasaCobranzaPct: number = 85; // % de cobro estimado de la cartera
    let nuevasVentasEstimadas: number = 0; // Ingresos adicionales por ventas proyectadas
    let gastosContingencia: number = 0; // Colchón de gastos imprevistos

    // Métricas calculadas
    let metricas = {
        totalCajas: 0,
        totalCuentasPorCobrarNominal: 0,
        totalCobranzaPonderada: 0,
        totalNuevosIngresos: 0,
        totalIngresosProyectados: 0,
        totalPedidosProveedores: 0,
        totalCostosOperativos: 0,
        totalEgresosBase: 0,
        totalGastosContingencia: 0,
        totalEgresosProyectados: 0,
        flujoNetoProyectado: 0,
        saldoCajaFinalProyectado: 0,
        ratioCoberturaProyectada: 0,
        ratioPruebaAcida: 0,
        cantCuentasCobrar: 0,
        cantPedidosProveedores: 0,
        cantCostosOperativos: 0,
        cantObligacionesTotales: 0
    };

    onMount(async () => {
        const userData = await checkUser("");
        if (userData) {
            user.set(userData);
        }
        await cargarDatos();
    });

    async function cargarDatos() {
        loading = true;
        error = null;
        try {
            const fechaParam = modoPeriodo === 'historico' ? 'all' : (selectedMes ? `${selectedMes}-01` : 'all');

            const [resVentas, resPedidos, resCostos, resCajas] = await Promise.all([
                fetchEntity("ventas", [], false, null, "Pendiente", fechaParam),
                fetchEntity("pedidos", [], false, null, "Pendiente", fechaParam),
                fetchEntity("costos", [], false, null, "Pendiente", fechaParam),
                fetchEntity("cajas", [], false, null, "", "")
            ]);

            ventasPendientes = resVentas.entities || [];
            pedidosPendientes = resPedidos.entities || [];
            costosPendientes = resCostos.entities || [];

            // Fallback para costos si vinieran por nombre alternativo
            if (costosPendientes.length === 0) {
                const resCostosFijos = await fetchEntity("costos_fijos", [], false, null, "Pendiente", fechaParam);
                costosPendientes = resCostosFijos.entities || [];
            }

            cajas = resCajas.entities || [];

            recalcularProyeccion();
        } catch (e: any) {
            error = e.message || "Error al calcular la proyección financiera";
        } finally {
            loading = false;
        }
    }

    function recalcularProyeccion() {
        // 1. Dinero en cajas
        const totalCajas = cajas.reduce((acc, c) => acc + Number(c.monto || 0), 0);

        // 2. Cuentas por cobrar
        let totalCobrarNominal = 0;
        let cantCobrar = 0;
        ventasPendientes.forEach(v => {
            const tot = Number(v.total || 0);
            const pag = Number(v.total_pagado || 0);
            const saldo = Math.max(0, tot - pag);
            if (saldo > 0) {
                totalCobrarNominal += saldo;
                cantCobrar++;
            }
        });

        // Ingresos ponderados según simulación
        const cobranzaPonderada = totalCobrarNominal * (tasaCobranzaPct / 100);
        const totalIngresos = cobranzaPonderada + Number(nuevasVentasEstimadas || 0);

        // 3. Egresos: Pedidos + Costos
        let totalPedidos = 0;
        pedidosPendientes.forEach(p => {
            const tot = Number(p.total || 0);
            if (tot > 0 && !['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos', 'Cancelado'].includes(p.estado)) {
                totalPedidos += tot;
            }
        });

        let totalCostos = 0;
        costosPendientes.forEach(c => {
            const m = Number(c.monto || 0);
            if (m > 0 && !['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos'].includes(c.estado)) {
                totalCostos += m;
            }
        });

        const egresosBase = totalPedidos + totalCostos;
        const totalEgresos = egresosBase + Number(gastosContingencia || 0);

        // 4. Balances y Ratios
        const flujoNeto = totalIngresos - totalEgresos;
        const saldoCajaFinal = totalCajas + flujoNeto;

        // Ratio de Liquidez Total Proyectada = (Cajas + Ingresos) / Egresos
        const ratioCobertura = totalEgresos > 0 ? ((totalCajas + totalIngresos) / totalEgresos) * 100 : (totalCajas > 0 ? 100 : 0);
        // Prueba ácida inmediata = (Cajas + Cobros) / Egresos
        const ratioPruebaAcida = totalEgresos > 0 ? (totalCajas + cobranzaPonderada) / totalEgresos : 0;

        metricas = {
            totalCajas,
            totalCuentasPorCobrarNominal: totalCobrarNominal,
            totalCobranzaPonderada: cobranzaPonderada,
            totalNuevosIngresos: Number(nuevasVentasEstimadas || 0),
            totalIngresosProyectados: totalIngresos,
            totalPedidosProveedores: totalPedidos,
            totalCostosOperativos: totalCostos,
            totalEgresosBase: egresosBase,
            totalGastosContingencia: Number(gastosContingencia || 0),
            totalEgresosProyectados: totalEgresos,
            flujoNetoProyectado: flujoNeto,
            saldoCajaFinalProyectado: saldoCajaFinal,
            ratioCoberturaProyectada: ratioCobertura,
            ratioPruebaAcida,
            cantCuentasCobrar: cantCobrar,
            cantPedidosProveedores: pedidosPendientes.length,
            cantCostosOperativos: costosPendientes.length,
            cantObligacionesTotales: pedidosPendientes.length + costosPendientes.length
        };
    }

    // Reactividad a cambios en los parámetros del simulador
    $: if (tasaCobranzaPct !== undefined || nuevasVentasEstimadas !== undefined || gastosContingencia !== undefined) {
        recalcularProyeccion();
    }

    function aplicarEscenario(tipo: 'conservador' | 'moderado' | 'optimista') {
        if (tipo === 'conservador') {
            tasaCobranzaPct = 65;
            nuevasVentasEstimadas = 0;
            gastosContingencia = Math.round(metricas.totalEgresosBase * 0.1);
        } else if (tipo === 'moderado') {
            tasaCobranzaPct = 85;
            nuevasVentasEstimadas = Math.round(metricas.totalCuentasPorCobrarNominal * 0.15);
            gastosContingencia = 0;
        } else if (tipo === 'optimista') {
            tasaCobranzaPct = 100;
            nuevasVentasEstimadas = Math.round(metricas.totalCuentasPorCobrarNominal * 0.3);
            gastosContingencia = 0;
        }
        recalcularProyeccion();
    }

    function handlePeriodoChange(modo: 'historico' | 'mes') {
        modoPeriodo = modo;
        cargarDatos();
    }

    function handleMesChange() {
        if (modoPeriodo === 'mes') {
            cargarDatos();
        }
    }

    function printReport() {
        window.print();
    }

    function exportarCSV() {
        const rows = [
            ["Concepto", "Monto"],
            ["Saldo Disponible en Cajas Actual", metricas.totalCajas.toFixed(2)],
            ["Cuentas por Cobrar (Nominal)", metricas.totalCuentasPorCobrarNominal.toFixed(2)],
            ["Tasa de Efectividad de Cobranza Simulada", `${tasaCobranzaPct}%`],
            ["Cobranzas Proyectadas Ponderadas", metricas.totalCobranzaPonderada.toFixed(2)],
            ["Nuevas Ventas Estimadas", metricas.totalNuevosIngresos.toFixed(2)],
            ["TOTAL INGRESOS PROYECTADOS", metricas.totalIngresosProyectados.toFixed(2)],
            ["Compromisos con Proveedores (Pedidos)", metricas.totalPedidosProveedores.toFixed(2)],
            ["Costos Fijos y Gastos Operativos", metricas.totalCostosOperativos.toFixed(2)],
            ["Reserva para Gastos Contingencia", metricas.totalGastosContingencia.toFixed(2)],
            ["TOTAL EGRESOS PROYECTADOS", metricas.totalEgresosProyectados.toFixed(2)],
            ["FLUJO NETO PROYECTADO", metricas.flujoNetoProyectado.toFixed(2)],
            ["SALDO FINAL DE CAJA PROYECTADO", metricas.saldoCajaFinalProyectado.toFixed(2)],
            ["Ratio de Cobertura Total", `${metricas.ratioCoberturaProyectada.toFixed(1)}%`]
        ];

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + rows.map(e => `"${e[0]}","${e[1]}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `proyeccion_financiera_${today.toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function formatCurrency(val: number): string {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val || 0);
    }

    function formatDate(dateStr: string): string {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
</script>

<div class="projection-page">
    <!-- Top Action Bar -->
    <div class="top-action-bar no-print">
        <GoBack route="/reportes" />

        <div class="header-actions">
            <button class="action-btn secondary" on:click={cargarDatos} title="Recargar datos reales">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Actualizar</span>
            </button>
            <button class="action-btn secondary" on:click={exportarCSV} title="Descargar planilla de proyección en CSV">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Exportar CSV</span>
            </button>
            <button class="action-btn primary" on:click={printReport} title="Imprimir o guardar como PDF">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                <span>Imprimir / PDF</span>
            </button>
        </div>
    </div>

    <!-- Main Header Card -->
    <header class="report-header-banner">
        <div class="header-content">
            <span class="report-category-badge">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Planeamiento Financiero & Flujo de Fondos
            </span>
            <h1>Proyección Financiera de Tesorería</h1>
            <p>Simulación prospectiva de liquidez a corto plazo: contrasta los saldos de caja actuales y flujos de cobranzas esperadas contra los compromisos de pago asumidos.</p>
        </div>

        <!-- Filter Controls -->
        <div class="filter-strip no-print">
            <div class="filter-group">
                <span class="filter-label">Alcance de Cartera:</span>
                <div class="btn-group-segmented">
                    <button 
                        class:active={modoPeriodo === 'historico'} 
                        on:click={() => handlePeriodoChange('historico')}
                    >Cartera Acumulada Completa</button>
                    <button 
                        class:active={modoPeriodo === 'mes'} 
                        on:click={() => handlePeriodoChange('mes')}
                    >Mes Específico</button>
                </div>
            </div>

            {#if modoPeriodo === 'mes'}
                <div class="filter-group">
                    <label for="mes-selector">Período:</label>
                    <input 
                        type="month" 
                        id="mes-selector"
                        bind:value={selectedMes} 
                        on:change={handleMesChange} 
                    />
                </div>
            {/if}

            <div class="status-summary-chip ml-auto">
                {#if metricas.saldoCajaFinalProyectado >= metricas.totalEgresosProyectados * 0.5}
                    <span class="dot green"></span>
                    <span class="text">Salud Financiera Sólida</span>
                {:else if metricas.saldoCajaFinalProyectado > 0}
                    <span class="dot yellow"></span>
                    <span class="text">Liquidez Ajustada</span>
                {:else}
                    <span class="dot red"></span>
                    <span class="text">Alerta de Déficit de Caja</span>
                {/if}
            </div>
        </div>
    </header>

    {#if loading}
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Calculando flujos proyectados y balances de tesorería...</p>
        </div>
    {:else if error}
        <div class="error-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{error}</span>
        </div>
    {:else}
        <!-- 6 High-Impact Primary KPI Cards -->
        <section class="kpi-grid">
            <!-- 1. Saldo Actual en Cajas -->
            <div class="kpi-card brand">
                <div class="kpi-top">
                    <span class="kpi-label">Disponible Real en Cajas</span>
                    <div class="kpi-icon brand">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-indigo">{formatCurrency(metricas.totalCajas)}</div>
                <div class="kpi-footer">
                    <span class="kpi-sub">Total en <strong>{cajas.length}</strong> cajas activas</span>
                </div>
            </div>

            <!-- 2. Ingresos Proyectados (Cobranzas Ponderadas) -->
            <div class="kpi-card emerald">
                <div class="kpi-top">
                    <span class="kpi-label">Ingresos Proyectados</span>
                    <div class="kpi-icon emerald">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-emerald">{formatCurrency(metricas.totalIngresosProyectados)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-success">{tasaCobranzaPct}% cobranza cartera</span>
                    <span class="kpi-sub">{metricas.cantCuentasCobrar} facturas a cobrar</span>
                </div>
            </div>

            <!-- 3. Egresos Proyectados (Proveedores + Costos) -->
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <span class="kpi-label">Egresos Proyectados</span>
                    <div class="kpi-icon amber">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-amber">{formatCurrency(metricas.totalEgresosProyectados)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-warning">{metricas.cantObligacionesTotales} pasivos</span>
                    <span class="kpi-sub">Proveedores & Gastos</span>
                </div>
            </div>

            <!-- 4. Flujo Neto Proyectado (Inflows - Outflows) -->
            <div class="kpi-card {metricas.flujoNetoProyectado >= 0 ? 'purple' : 'rose'}">
                <div class="kpi-top">
                    <span class="kpi-label">Flujo Neto del Período</span>
                    <div class="kpi-icon {metricas.flujoNetoProyectado >= 0 ? 'purple' : 'rose'}">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    </div>
                </div>
                <div class="kpi-value {metricas.flujoNetoProyectado >= 0 ? 'text-purple' : 'text-red'}">
                    {metricas.flujoNetoProyectado >= 0 ? '+' : ''}{formatCurrency(metricas.flujoNetoProyectado)}
                </div>
                <div class="kpi-footer">
                    <span class="badge {metricas.flujoNetoProyectado >= 0 ? 'badge-purple' : 'badge-danger'}">
                        {metricas.flujoNetoProyectado >= 0 ? 'Superávit Operativo' : 'Déficit Operativo'}
                    </span>
                    <span class="kpi-sub">Ingresos - Egresos</span>
                </div>
            </div>

            <!-- 5. Posición Final de Caja Proyectada -->
            <div class="kpi-card highlight-final {metricas.saldoCajaFinalProyectado >= 0 ? 'emerald-glow' : 'red-glow'}">
                <div class="kpi-top">
                    <span class="kpi-label font-bold">Caja Final Proyectada</span>
                    <div class="kpi-icon {metricas.saldoCajaFinalProyectado >= 0 ? 'emerald' : 'red'}">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value {metricas.saldoCajaFinalProyectado >= 0 ? 'text-emerald' : 'text-red'}">
                    {formatCurrency(metricas.saldoCajaFinalProyectado)}
                </div>
                <div class="kpi-footer">
                    <span class="kpi-sub">
                        {#if metricas.saldoCajaFinalProyectado >= 0}
                            🟢 Liquidez suficiente para operar
                        {:else}
                            🔴 Alerta: Brecha de financiamiento requerida
                        {/if}
                    </span>
                </div>
            </div>

            <!-- 6. Ratio de Cobertura y Prueba Ácida -->
            <div class="kpi-card sky">
                <div class="kpi-top">
                    <span class="kpi-label">Ratio de Cobertura Global</span>
                    <div class="kpi-icon sky">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-sky">{metricas.ratioCoberturaProyectada.toFixed(1)}%</div>
                <div class="kpi-footer">
                    <span class="kpi-sub">Prueba Ácida: <strong>{metricas.ratioPruebaAcida.toFixed(2)}x</strong></span>
                    <span class="badge {metricas.ratioCoberturaProyectada >= 100 ? 'badge-success' : 'badge-danger'}">
                        {metricas.ratioCoberturaProyectada >= 100 ? 'Respaldado' : 'Déficit'}
                    </span>
                </div>
            </div>
        </section>

        <!-- Interactive Scenario Simulator (What-If Controls) -->
        <section class="simulator-section no-print">
            <div class="simulator-header">
                <div>
                    <span class="simulator-tag">Simulador Dinámico de Escenarios (What-If)</span>
                    <h3>Ajuste de Variables y Sensibilidad de Liquidez</h3>
                    <p>Evalúa cómo impactan diferentes tasas de efectividad en las cobranzas o gastos contingentes sobre el saldo final de caja.</p>
                </div>

                <div class="scenario-quick-presets">
                    <span class="preset-label">Escenarios Rápidos:</span>
                    <button class="preset-btn conservador" on:click={() => aplicarEscenario('conservador')}>
                        🛡️ Conservador
                    </button>
                    <button class="preset-btn moderado" on:click={() => aplicarEscenario('moderado')}>
                        ⚖️ Moderado
                    </button>
                    <button class="preset-btn optimista" on:click={() => aplicarEscenario('optimista')}>
                        🚀 Optimista
                    </button>
                </div>
            </div>

            <div class="simulator-controls-grid">
                <!-- 1. Slider Tasa de Cobranza -->
                <div class="control-box">
                    <div class="control-top">
                        <label for="slider-cobranza">Efectividad de Cobro de Cartera:</label>
                        <span class="control-value-badge">{tasaCobranzaPct}%</span>
                    </div>
                    <input 
                        type="range" 
                        id="slider-cobranza" 
                        min="20" 
                        max="100" 
                        step="5" 
                        bind:value={tasaCobranzaPct} 
                        class="slider-range"
                    />
                    <div class="control-hints">
                        <span>20% (Crítico)</span>
                        <span>85% (Estándar)</span>
                        <span>100% (Total)</span>
                    </div>
                    <span class="control-desc">Ingreso estimado: <strong>{formatCurrency(metricas.totalCobranzaPonderada)}</strong> de {formatCurrency(metricas.totalCuentasPorCobrarNominal)} nominales</span>
                </div>

                <!-- 2. Nuevas Ventas Proyectadas -->
                <div class="control-box">
                    <div class="control-top">
                        <label for="input-ventas-est">Ventas Adicionales Proyectadas ($):</label>
                    </div>
                    <div class="input-money-wrap">
                        <span class="currency-prefix">$</span>
                        <input 
                            type="number" 
                            id="input-ventas-est" 
                            min="0" 
                            step="1000" 
                            bind:value={nuevasVentasEstimadas} 
                            placeholder="0" 
                        />
                    </div>
                    <span class="control-desc">Ingresos adicionales esperados por nuevas facturaciones directas en el período.</span>
                </div>

                <!-- 3. Gastos de Contingencia -->
                <div class="control-box">
                    <div class="control-top">
                        <label for="input-contingencia">Colchón / Imprevistos ($):</label>
                    </div>
                    <div class="input-money-wrap">
                        <span class="currency-prefix">$</span>
                        <input 
                            type="number" 
                            id="input-contingencia" 
                            min="0" 
                            step="1000" 
                            bind:value={gastosContingencia} 
                            placeholder="0" 
                        />
                    </div>
                    <span class="control-desc">Reserva de seguridad adicional para gastos de emergencia u oscilaciones de costos.</span>
                </div>
            </div>
        </section>

        <!-- Waterfall / Cascada de Fondos Visual -->
        <section class="waterfall-section">
            <div class="section-title">
                <h2>Cascada de Flujo de Fondos (Trayectoria de Tesorería)</h2>
                <p>Evolución paso a paso desde el saldo inicial en caja hasta la posición proyectada final.</p>
            </div>

            <div class="waterfall-grid">
                <!-- 1. Saldo Inicial -->
                <div class="waterfall-card base">
                    <span class="step-num">Paso 1</span>
                    <h4 class="step-title">Saldo en Cajas Actual</h4>
                    <div class="step-value text-indigo">{formatCurrency(metricas.totalCajas)}</div>
                    <span class="step-desc">Dinero real disponible en cuentas y cajas registradoras.</span>
                </div>

                <div class="waterfall-arrow plus">+</div>

                <!-- 2. Cobros de Cartera -->
                <div class="waterfall-card inflow">
                    <span class="step-num">Paso 2</span>
                    <h4 class="step-title">Cobranzas de Cartera</h4>
                    <div class="step-value text-emerald">+{formatCurrency(metricas.totalCobranzaPonderada)}</div>
                    <span class="step-desc">Cobro proyectado ({tasaCobranzaPct}% de efectividad).</span>
                </div>

                {#if metricas.totalNuevosIngresos > 0}
                    <div class="waterfall-arrow plus">+</div>
                    <div class="waterfall-card inflow">
                        <span class="step-num">Paso 2b</span>
                        <h4 class="step-title">Nuevas Ventas</h4>
                        <div class="step-value text-emerald">+{formatCurrency(metricas.totalNuevosIngresos)}</div>
                        <span class="step-desc">Ingresos extraordinarios simulados.</span>
                    </div>
                {/if}

                <div class="waterfall-arrow minus">-</div>

                <!-- 3. Pagos a Proveedores -->
                <div class="waterfall-card outflow">
                    <span class="step-num">Paso 3</span>
                    <h4 class="step-title">Órdenes a Proveedores</h4>
                    <div class="step-value text-amber">-{formatCurrency(metricas.totalPedidosProveedores)}</div>
                    <span class="step-desc">{metricas.cantPedidosProveedores} pedidos comerciales de compra.</span>
                </div>

                <div class="waterfall-arrow minus">-</div>

                <!-- 4. Costos Operativos -->
                <div class="waterfall-card outflow">
                    <span class="step-num">Paso 4</span>
                    <h4 class="step-title">Costos & Gastos Fijos</h4>
                    <div class="step-value text-purple">-{formatCurrency(metricas.totalCostosOperativos)}</div>
                    <span class="step-desc">{metricas.cantCostosOperativos} costos y gastos operativos.</span>
                </div>

                {#if metricas.totalGastosContingencia > 0}
                    <div class="waterfall-arrow minus">-</div>
                    <div class="waterfall-card outflow">
                        <span class="step-num">Paso 4b</span>
                        <h4 class="step-title">Imprevistos</h4>
                        <div class="step-value text-red">-{formatCurrency(metricas.totalGastosContingencia)}</div>
                        <span class="step-desc">Colchón de seguridad presupuestario.</span>
                    </div>
                {/if}

                <div class="waterfall-arrow equals">=</div>

                <!-- 5. Posición Final -->
                <div class="waterfall-card final {metricas.saldoCajaFinalProyectado >= 0 ? 'positive' : 'negative'}">
                    <span class="step-num">Paso 5</span>
                    <h4 class="step-title">Caja Final Proyectada</h4>
                    <div class="step-value {metricas.saldoCajaFinalProyectado >= 0 ? 'text-emerald' : 'text-red'}">
                        {formatCurrency(metricas.saldoCajaFinalProyectado)}
                    </div>
                    <span class="step-desc">
                        {metricas.saldoCajaFinalProyectado >= 0 ? 'Superávit final estimado' : 'Déficit proyectado a cubrir'}
                    </span>
                </div>
            </div>
        </section>

        <!-- Detailed Breakdown Tabs (Entradas, Salidas, Cajas) -->
        <section class="breakdown-section">
            <div class="breakdown-header">
                <div>
                    <h2>Desglose Analítico de Componentes</h2>
                    <p>Detalle de todas las partidas que componen la proyección financiera.</p>
                </div>

                <div class="tab-buttons-group no-print">
                    <button 
                        class:active={activeTab === 'entradas'} 
                        on:click={() => activeTab = 'entradas'}
                    >
                        Entradas ({ventasPendientes.length})
                    </button>
                    <button 
                        class:active={activeTab === 'salidas'} 
                        on:click={() => activeTab = 'salidas'}
                    >
                        Salidas ({metricas.cantObligacionesTotales})
                    </button>
                    <button 
                        class:active={activeTab === 'cajas'} 
                        on:click={() => activeTab = 'cajas'}
                    >
                        Cajas Activas ({cajas.length})
                    </button>
                </div>
            </div>

            <!-- Tab 1: Entradas (Cuentas por Cobrar) -->
            {#if activeTab === 'entradas'}
                {#if ventasPendientes.length === 0}
                    <div class="empty-state">
                        <p>No hay cuentas por cobrar pendientes en el período seleccionado.</p>
                    </div>
                {:else}
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Comprobante</th>
                                    <th>Cliente</th>
                                    <th>Fecha Emisión</th>
                                    <th class="text-right">Total Facturado</th>
                                    <th class="text-right">Cobrado</th>
                                    <th class="text-right">Saldo Pendiente</th>
                                    <th class="text-right">Cobro Ponderado ({tasaCobranzaPct}%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each ventasPendientes as v}
                                    {@const tot = Number(v.total || 0)}
                                    {@const pag = Number(v.total_pagado || 0)}
                                    {@const saldo = Math.max(0, tot - pag)}
                                    {#if saldo > 0}
                                        <tr>
                                            <td class="font-mono font-bold text-white">{v.cod || ('#' + v.id)}</td>
                                            <td>
                                                <span class="client-name">
                                                    {v.cliente ? `${v.cliente.nombre || ''} ${v.cliente.apellido || ''}`.trim() || 'Cliente Sin Nombre' : 'Consumidor Final'}
                                                </span>
                                            </td>
                                            <td class="font-mono text-muted">{formatDate(v.creadoEn || v.createdAt)}</td>
                                            <td class="text-right font-mono text-muted">{formatCurrency(tot)}</td>
                                            <td class="text-right font-mono text-muted">{pag > 0 ? formatCurrency(pag) : '-'}</td>
                                            <td class="text-right font-mono font-bold text-amber">{formatCurrency(saldo)}</td>
                                            <td class="text-right font-mono font-bold text-emerald">
                                                {formatCurrency(saldo * (tasaCobranzaPct / 100))}
                                            </td>
                                        </tr>
                                    {/if}
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            {/if}

            <!-- Tab 2: Salidas (Pedidos + Costos) -->
            {#if activeTab === 'salidas'}
                {#if metricas.cantObligacionesTotales === 0}
                    <div class="empty-state">
                        <p>No hay obligaciones comerciales ni costos pendientes en el período seleccionado.</p>
                    </div>
                {:else}
                    <div class="table-responsive">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Comprobante</th>
                                    <th>Acreedor / Concepto</th>
                                    <th>Categoría</th>
                                    <th>Fecha</th>
                                    <th class="text-right">Monto Exigible</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Pedidos -->
                                {#each pedidosPendientes as p}
                                    {@const totP = Number(p.total || 0)}
                                    {#if totP > 0 && !['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos', 'Cancelado'].includes(p.estado)}
                                        <tr>
                                            <td><span class="badge badge-info">Proveedor</span></td>
                                            <td class="font-mono font-bold text-white">{p.cod || ('#' + p.id)}</td>
                                            <td>
                                                <span class="client-name">{p.proveedor?.nombre || 'Proveedor Comercial'}</span>
                                            </td>
                                            <td class="text-muted font-sm">Compra de Insumos / Mercadería</td>
                                            <td class="font-mono text-muted">{formatDate(p.fecha_emision || p.creadoEn)}</td>
                                            <td class="text-right font-mono font-bold text-amber">{formatCurrency(totP)}</td>
                                        </tr>
                                    {/if}
                                {/each}

                                <!-- Costos -->
                                {#each costosPendientes as c}
                                    {@const mC = Number(c.monto || 0)}
                                    {#if mC > 0 && !['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos'].includes(c.estado)}
                                        <tr>
                                            <td><span class="badge badge-purple">Costo Fijo</span></td>
                                            <td class="font-mono font-bold text-white">{c.cod || ('#' + c.id)}</td>
                                            <td>
                                                <span class="client-name">{c.descripcion || c.categoria || 'Gasto Operativo'}</span>
                                            </td>
                                            <td><span class="badge badge-purple">{c.categoria || 'Operativo'}</span></td>
                                            <td class="font-mono text-muted">{formatDate(c.creadoEn)}</td>
                                            <td class="text-right font-mono font-bold text-amber">{formatCurrency(mC)}</td>
                                        </tr>
                                    {/if}
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            {/if}

            <!-- Tab 3: Cajas Activas -->
            {#if activeTab === 'cajas'}
                {#if cajas.length === 0}
                    <div class="empty-state">
                        <p>No se encontraron cajas registradoras registradas.</p>
                    </div>
                {:else}
                    <div class="cajas-grid">
                        {#each cajas as caja}
                            {@const saldoCaja = Number(caja.monto || 0)}
                            {@const pct = metricas.totalCajas > 0 ? (saldoCaja / metricas.totalCajas) * 100 : 0}
                            <div class="caja-card">
                                <div class="caja-card-header">
                                    <span class="caja-badge">Caja Registradora</span>
                                    <h4>{caja.nombre}</h4>
                                </div>
                                <div class="caja-monto">{formatCurrency(saldoCaja)}</div>
                                <div class="caja-progress-wrap">
                                    <div class="caja-bar-bg">
                                        <div class="caja-bar-fill" style="width: {Math.min(100, pct)}%"></div>
                                    </div>
                                    <span class="caja-pct">{pct.toFixed(1)}% de la liquidez</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
        </section>
    {/if}
</div>

<style>
    .projection-page {
        width: 100%;
        max-width: 1350px;
        margin: 0 auto;
        padding: 2rem 1.5rem 5rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2.25rem;
        min-height: 100vh;
    }

    .top-action-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .action-btn {
        padding: 0.6rem 1.15rem;
        border-radius: var(--radius-md);
        font-size: 0.88rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all var(--transition-fast);
        border: 1px solid var(--glass-border);
    }

    .action-btn.secondary {
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }

    .action-btn.secondary:hover {
        background: var(--bg-tertiary);
        color: #ffffff;
        border-color: var(--glass-border-hover);
    }

    .action-btn.primary {
        background: var(--color-brand);
        color: #ffffff;
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 4px 14px var(--color-brand-glow);
    }

    .action-btn.primary:hover {
        background: var(--color-brand-hover);
        transform: translateY(-1px);
    }

    /* Main Banner */
    .report-header-banner {
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.6) 0%, rgba(19, 27, 46, 0.85) 100%);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 2.25rem;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-md);
    }

    .header-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .report-category-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #c084fc;
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.3);
        padding: 0.3rem 0.75rem;
        border-radius: var(--radius-full);
        width: fit-content;
    }

    .header-content h1 {
        font-size: 2.25rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.03em;
    }

    .header-content p {
        color: var(--text-secondary);
        font-size: 1.05rem;
        max-width: 780px;
        line-height: 1.5;
    }

    .filter-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--glass-border);
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .filter-label, .filter-group label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .btn-group-segmented {
        display: inline-flex;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.2rem;
        gap: 0.2rem;
    }

    .btn-group-segmented button {
        background: transparent;
        color: var(--text-secondary);
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
        font-weight: 600;
        transition: all var(--transition-fast);
        border: none;
        cursor: pointer;
    }

    .btn-group-segmented button.active {
        background: var(--color-brand);
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .status-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--glass-border);
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-full);
        font-size: 0.82rem;
        font-weight: 700;
    }

    .status-summary-chip .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .status-summary-chip .dot.green { background: #34d399; box-shadow: 0 0 8px rgba(52, 211, 153, 0.5); }
    .status-summary-chip .dot.yellow { background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.5); }
    .status-summary-chip .dot.red { background: #f87171; box-shadow: 0 0 8px rgba(248, 113, 113, 0.5); }

    .ml-auto {
        margin-left: auto;
    }

    /* KPI Grid */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
    }

    .kpi-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.75rem;
        backdrop-filter: blur(8px);
        transition: all 0.2s ease;
        position: relative;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: var(--glass-border-hover);
        box-shadow: var(--shadow-md);
    }

    .kpi-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .kpi-label {
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
        color: var(--text-muted);
    }

    .kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .kpi-icon.brand { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .kpi-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .kpi-icon.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .kpi-icon.rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .kpi-icon.sky { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
    .kpi-icon.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .kpi-value {
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #ffffff;
    }

    .text-indigo { color: #818cf8 !important; }
    .text-emerald { color: #34d399 !important; }
    .text-amber { color: #fbbf24 !important; }
    .text-purple { color: #c084fc !important; }
    .text-red { color: #f87171 !important; }
    .text-sky { color: #38bdf8 !important; }

    .kpi-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 0.4rem;
        font-size: 0.8rem;
    }

    .kpi-sub {
        color: var(--text-secondary);
    }

    .badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-full);
    }

    .badge-success {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .badge-info {
        background: rgba(14, 165, 233, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(14, 165, 233, 0.25);
    }

    .badge-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .badge-danger {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.25);
    }

    .badge-purple {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.25);
    }

    .highlight-final {
        border-width: 2px;
    }

    .emerald-glow {
        border-color: rgba(16, 185, 129, 0.4);
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.7) 0%, rgba(16, 185, 129, 0.08) 100%);
    }

    .red-glow {
        border-color: rgba(239, 68, 68, 0.4);
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.7) 0%, rgba(239, 68, 68, 0.08) 100%);
    }

    /* Simulator Section */
    .simulator-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .simulator-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .simulator-tag {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #c084fc;
        letter-spacing: 0.05em;
    }

    .simulator-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin-top: 0.2rem;
    }

    .simulator-header p {
        font-size: 0.88rem;
        color: var(--text-secondary);
        max-width: 650px;
    }

    .scenario-quick-presets {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .preset-label {
        font-size: 0.82rem;
        color: var(--text-muted);
        font-weight: 600;
    }

    .preset-btn {
        padding: 0.4rem 0.8rem;
        border-radius: var(--radius-md);
        font-size: 0.8rem;
        font-weight: 700;
        border: 1px solid var(--glass-border);
        cursor: pointer;
        transition: all var(--transition-fast);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .preset-btn.conservador:hover { background: rgba(245, 158, 11, 0.2); border-color: #fbbf24; }
    .preset-btn.moderado:hover { background: rgba(99, 102, 241, 0.2); border-color: #818cf8; }
    .preset-btn.optimista:hover { background: rgba(16, 185, 129, 0.2); border-color: #34d399; }

    .simulator-controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
    }

    .control-box {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .control-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .control-top label {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .control-value-badge {
        font-size: 0.82rem;
        font-weight: 800;
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        font-family: monospace;
    }

    .slider-range {
        width: 100%;
        accent-color: var(--color-brand);
        cursor: pointer;
    }

    .control-hints {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--text-muted);
    }

    .control-desc {
        font-size: 0.78rem;
        color: var(--text-secondary);
        line-height: 1.4;
    }

    .input-money-wrap {
        display: flex;
        align-items: center;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0 0.75rem;
    }

    .currency-prefix {
        color: var(--text-muted);
        font-weight: 700;
    }

    .input-money-wrap input {
        border: none;
        background: transparent;
        padding: 0.55rem 0.5rem;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 700;
        outline: none;
        width: 100%;
    }

    /* Waterfall Section */
    .waterfall-section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section-title h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .section-title p {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .waterfall-grid {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
    }

    .waterfall-card {
        flex: 1;
        min-width: 170px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        text-align: left;
    }

    .step-num {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
    }

    .step-title {
        font-size: 0.88rem;
        font-weight: 700;
        color: #ffffff;
    }

    .step-value {
        font-size: 1.25rem;
        font-weight: 800;
        font-family: monospace;
    }

    .step-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
        line-height: 1.3;
    }

    .waterfall-arrow {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-muted);
        padding: 0 0.25rem;
    }

    .waterfall-arrow.plus { color: #34d399; }
    .waterfall-arrow.minus { color: #f87171; }
    .waterfall-arrow.equals { color: #818cf8; }

    .waterfall-card.final.positive {
        border-color: rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.08);
    }

    .waterfall-card.final.negative {
        border-color: rgba(239, 68, 68, 0.35);
        background: rgba(239, 68, 68, 0.08);
    }

    /* Breakdown Section */
    .breakdown-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        box-shadow: var(--shadow-sm);
    }

    .breakdown-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .breakdown-header h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
    }

    .breakdown-header p {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .tab-buttons-group {
        display: inline-flex;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.25rem;
        gap: 0.25rem;
    }

    .tab-buttons-group button {
        background: transparent;
        color: var(--text-secondary);
        padding: 0.45rem 1rem;
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
        border: none;
    }

    .tab-buttons-group button.active {
        background: var(--color-brand);
        color: #ffffff;
    }

    .table-responsive {
        width: 100%;
        overflow-x: auto;
    }

    .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;
    }

    .report-table th {
        text-align: left;
        padding: 0.85rem 1rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        background: rgba(11, 15, 25, 0.4);
        border-bottom: 1px solid var(--glass-border);
    }

    .report-table td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        color: var(--text-primary);
        vertical-align: middle;
    }

    .report-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    .client-name {
        font-weight: 600;
        color: #ffffff;
    }

    /* Cajas Grid */
    .cajas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
    }

    .caja-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .caja-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .caja-badge {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #818cf8;
    }

    .caja-card-header h4 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
    }

    .caja-monto {
        font-size: 1.5rem;
        font-weight: 800;
        color: #34d399;
        font-family: monospace;
    }

    .caja-progress-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .caja-bar-bg {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .caja-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
        border-radius: var(--radius-full);
    }

    .caja-pct {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
        min-width: 65px;
        text-align: right;
    }

    /* Utilities */
    .text-right { text-align: right !important; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-sm { font-size: 0.8rem; }
    .text-muted { color: var(--text-muted) !important; }
    .text-white { color: #ffffff !important; }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted);
    }

    .loading-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 5rem 1rem;
        color: var(--text-secondary);
    }

    .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .error-box {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #f87171;
        padding: 1.25rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    /* Print Styles */
    @media print {
        .no-print {
            display: none !important;
        }

        .projection-page {
            max-width: 100% !important;
            padding: 0 !important;
            color: #000000 !important;
        }

        .report-header-banner, .kpi-card, .waterfall-card, .breakdown-section, .caja-card {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            break-inside: avoid;
        }

        .header-content h1, .section-title h2, .breakdown-header h2, .kpi-value, .step-title, .caja-card-header h4 {
            color: #000000 !important;
        }

        .kpi-label, .report-table th, .text-muted, .step-num {
            color: #475569 !important;
        }

        .report-table th {
            background: #f1f5f9 !important;
            border-bottom: 2px solid #cbd5e1 !important;
        }

        .report-table td {
            border-bottom: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .projection-page {
            padding: 1rem 0.75rem 3rem 0.75rem;
            gap: 1.5rem;
        }

        .report-header-banner {
            padding: 1.5rem;
        }

        .header-content h1 {
            font-size: 1.65rem;
        }

        .filter-strip {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .ml-auto {
            margin-left: 0;
            width: 100%;
        }

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .waterfall-grid {
            flex-direction: column;
            align-items: stretch;
        }

        .waterfall-arrow {
            text-align: center;
        }

        .simulator-header {
            flex-direction: column;
        }

        .scenario-quick-presets {
            width: 100%;
        }
    }
</style>
