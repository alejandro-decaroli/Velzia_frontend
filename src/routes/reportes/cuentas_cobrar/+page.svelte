<script lang="ts">
    import { onMount } from 'svelte';
    import GoBack from "$lib/components/goback.svelte";
    import ButtonPagar from "$lib/components/buttonPagar.svelte";
    import { fetchEntity } from '$lib/utils/api.js';
    import { checkUser, user } from "$lib/stores/auth.js";
    import { goto } from '$app/navigation';

    let error: string | null = null;
    let loading = true;

    // Ventas y cajas
    let ventas: any[] = [];
    let cajas: any[] = [];

    // Filtros interactivos
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    let modoPeriodo: 'historico' | 'mes' = 'historico';
    let selectedMes: string = currentMonthStr;
    let filtroMora: 'todos' | 'al_dia' | 'atencion' | 'mora_media' | 'mora_critica' = 'todos';
    let busquedaCliente: string = "";
    let ordenSeleccionado: 'monto_desc' | 'monto_asc' | 'antiguedad_desc' | 'antiguedad_asc' | 'cliente_asc' = 'monto_desc';

    // Modal de detalle de venta
    let ventaSeleccionadaModal: any | null = null;

    // Interfaz de Venta Enriquecida con cálculos de cartera
    interface VentaCobro {
        id: number | string;
        cod: string;
        cliente: any;
        clienteNombre: string;
        clienteContacto: string;
        clienteTelefono: string;
        clienteEmail: string;
        creadoEn: string;
        fechaDate: Date;
        diasAntiguedad: number;
        categoriaMora: 'al_dia' | 'atencion' | 'mora_media' | 'mora_critica';
        total: number;
        totalPagado: number;
        saldoPendiente: number;
        estado: string;
        linea_venta: any[];
    }

    interface ClienteDeudor {
        id: number | string;
        nombre: string;
        telefono: string;
        email: string;
        totalDeuda: number;
        cantVentas: number;
        diasMaxAntiguedad: number;
        participacionPct: number;
        peorCategoriaMora: 'al_dia' | 'atencion' | 'mora_media' | 'mora_critica';
    }

    let ventasCobro: VentaCobro[] = [];
    let topDeudores: ClienteDeudor[] = [];

    // Métricas globales
    let metricas = {
        totalPorCobrar: 0,
        cantVentasPendientes: 0,
        cantClientesDeudores: 0,
        ticketPromedioPendiente: 0,
        deudaPromedioCliente: 0,
        montoAlDia: 0,
        cantAlDia: 0,
        montoAtencion: 0,
        cantAtencion: 0,
        montoMoraMedia: 0,
        cantMoraMedia: 0,
        montoMoraCritica: 0,
        cantMoraCritica: 0,
        pctCritico: 0,
        concentracionTop3Pct: 0,
        clienteMayorDeuda: null as ClienteDeudor | null
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

            const [resVentas, resCajas] = await Promise.all([
                fetchEntity("ventas", [], false, null, "Pendiente", fechaParam),
                fetchEntity("cajas", [], false, null, "", "")
            ]);

            ventas = resVentas.entities || [];
            cajas = resCajas.entities || [];

            procesarMetricasYCuentas();
        } catch (e: any) {
            error = e.message || "Error al cargar reporte de cuentas por cobrar";
        } finally {
            loading = false;
        }
    }

    function calcularDiasAntiguedad(fechaStr: string): number {
        if (!fechaStr) return 0;
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return 0;
        const diffMs = today.getTime() - fecha.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    function clasificarMora(dias: number): 'al_dia' | 'atencion' | 'mora_media' | 'mora_critica' {
        if (dias <= 15) return 'al_dia';
        if (dias <= 30) return 'atencion';
        if (dias <= 60) return 'mora_media';
        return 'mora_critica';
    }

    function procesarMetricasYCuentas() {
        const items: VentaCobro[] = [];
        let totalPorCobrar = 0;
        let montoAlDia = 0;
        let cantAlDia = 0;
        let montoAtencion = 0;
        let cantAtencion = 0;
        let montoMoraMedia = 0;
        let cantMoraMedia = 0;
        let montoMoraCritica = 0;
        let cantMoraCritica = 0;

        const clienteMap: Record<string, ClienteDeudor> = {};

        ventas.forEach((v: any) => {
            const tot = Number(v.total || 0);
            const pag = Number(v.total_pagado || 0);
            const saldo = Math.max(0, tot - pag);

            // Consideramos solo aquellas con saldo pendiente positivo
            if (saldo <= 0) return;

            const dias = calcularDiasAntiguedad(v.creadoEn || v.createdAt);
            const cat = clasificarMora(dias);

            totalPorCobrar += saldo;

            if (cat === 'al_dia') {
                montoAlDia += saldo;
                cantAlDia++;
            } else if (cat === 'atencion') {
                montoAtencion += saldo;
                cantAtencion++;
            } else if (cat === 'mora_media') {
                montoMoraMedia += saldo;
                cantMoraMedia++;
            } else {
                montoMoraCritica += saldo;
                cantMoraCritica++;
            }

            const c = v.cliente;
            const cId = c?.id || 'sin_cliente';
            const cNombre = c ? `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'Cliente Sin Nombre' : 'Consumidor Final';
            const cTel = c?.telefono || '';
            const cEmail = c?.email || '';
            const cContacto = cTel || cEmail || '-';

            items.push({
                id: v.id,
                cod: v.cod || `#${v.id}`,
                cliente: c,
                clienteNombre: cNombre,
                clienteContacto: cContacto,
                clienteTelefono: cTel,
                clienteEmail: cEmail,
                creadoEn: v.creadoEn || v.createdAt || '',
                fechaDate: new Date(v.creadoEn || v.createdAt || Date.now()),
                diasAntiguedad: dias,
                categoriaMora: cat,
                total: tot,
                totalPagado: pag,
                saldoPendiente: saldo,
                estado: v.estado || 'Pendiente',
                linea_venta: v.linea_venta || []
            });

            // Agrupación de deudores
            if (!clienteMap[cId]) {
                clienteMap[cId] = {
                    id: cId,
                    nombre: cNombre,
                    telefono: cTel,
                    email: cEmail,
                    totalDeuda: 0,
                    cantVentas: 0,
                    diasMaxAntiguedad: 0,
                    participacionPct: 0,
                    peorCategoriaMora: cat
                };
            }

            clienteMap[cId].totalDeuda += saldo;
            clienteMap[cId].cantVentas += 1;
            if (dias > clienteMap[cId].diasMaxAntiguedad) {
                clienteMap[cId].diasMaxAntiguedad = dias;
                clienteMap[cId].peorCategoriaMora = cat;
            }
        });

        // Ordenar clientes por deuda
        const deudoresArray = Object.values(clienteMap).map(d => {
            d.participacionPct = totalPorCobrar > 0 ? (d.totalDeuda / totalPorCobrar) * 100 : 0;
            return d;
        });
        deudoresArray.sort((a, b) => b.totalDeuda - a.totalDeuda);
        topDeudores = deudoresArray;

        // Concentración de riesgo (Top 3)
        const sumaTop3 = topDeudores.slice(0, 3).reduce((acc, d) => acc + d.totalDeuda, 0);
        const concentracionTop3 = totalPorCobrar > 0 ? (sumaTop3 / totalPorCobrar) * 100 : 0;

        ventasCobro = items;

        metricas = {
            totalPorCobrar,
            cantVentasPendientes: items.length,
            cantClientesDeudores: deudoresArray.length,
            ticketPromedioPendiente: items.length > 0 ? totalPorCobrar / items.length : 0,
            deudaPromedioCliente: deudoresArray.length > 0 ? totalPorCobrar / deudoresArray.length : 0,
            montoAlDia,
            cantAlDia,
            montoAtencion,
            cantAtencion,
            montoMoraMedia,
            cantMoraMedia,
            montoMoraCritica,
            cantMoraCritica,
            pctCritico: totalPorCobrar > 0 ? (montoMoraCritica / totalPorCobrar) * 100 : 0,
            concentracionTop3Pct: concentracionTop3,
            clienteMayorDeuda: topDeudores.length > 0 ? topDeudores[0] : null
        };
    }

    // Reactividad para filtrado y ordenación
    $: ventasFiltradas = ventasCobro
        .filter(v => {
            // Filtro por tramo de morosidad
            if (filtroMora !== 'todos' && v.categoriaMora !== filtroMora) {
                return false;
            }
            // Filtro por búsqueda
            if (busquedaCliente.trim()) {
                const q = busquedaCliente.toLowerCase().trim();
                const nom = v.clienteNombre.toLowerCase();
                const cod = v.cod.toLowerCase();
                const tel = v.clienteTelefono.toLowerCase();
                const mail = v.clienteEmail.toLowerCase();
                return nom.includes(q) || cod.includes(q) || tel.includes(q) || mail.includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (ordenSeleccionado === 'monto_desc') return b.saldoPendiente - a.saldoPendiente;
            if (ordenSeleccionado === 'monto_asc') return a.saldoPendiente - b.saldoPendiente;
            if (ordenSeleccionado === 'antiguedad_desc') return b.diasAntiguedad - a.diasAntiguedad;
            if (ordenSeleccionado === 'antiguedad_asc') return a.diasAntiguedad - b.diasAntiguedad;
            if (ordenSeleccionado === 'cliente_asc') return a.clienteNombre.localeCompare(b.clienteNombre);
            return 0;
        });

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
        if (ventasFiltradas.length === 0) return;
        const headers = ["Comprobante", "Cliente", "Telefono", "Email", "Fecha Emision", "Dias Antiguedad", "Estado Mora", "Total Facturado", "Total Pagado", "Saldo Pendiente"];
        const rows = ventasFiltradas.map(v => [
            `"${v.cod}"`,
            `"${v.clienteNombre.replace(/"/g, '""')}"`,
            `"${v.clienteTelefono}"`,
            `"${v.clienteEmail}"`,
            `"${formatDate(v.creadoEn)}"`,
            v.diasAntiguedad,
            `"${getMoraLabel(v.categoriaMora)}"`,
            v.total.toFixed(2),
            v.totalPagado.toFixed(2),
            v.saldoPendiente.toFixed(2)
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `cuentas_por_cobrar_${today.toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function getWhatsAppUrl(cliente: any, venta: any, saldo: number): string | null {
        if (!cliente || !cliente.telefono) return null;
        const cleanPhone = String(cliente.telefono).replace(/[^0-9]/g, '');
        if (!cleanPhone || cleanPhone.length < 6) return null;
        const msg = encodeURIComponent(
            `Hola ${cliente.nombre || ''}, te contactamos de Velzia para recordarte el saldo pendiente de ${formatCurrency(saldo)} correspondiente al comprobante ${venta.cod || ('#' + venta.id)}. ¿Podríamos coordinar para saldarlo? ¡Muchas gracias!`
        );
        return `https://wa.me/${cleanPhone}?text=${msg}`;
    }

    function formatCurrency(val: number): string {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val || 0);
    }

    function formatNumber(val: number): string {
        return new Intl.NumberFormat("es-AR").format(val || 0);
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

    function getMoraLabel(cat: 'al_dia' | 'atencion' | 'mora_media' | 'mora_critica'): string {
        switch (cat) {
            case 'al_dia': return 'Al día (0-15d)';
            case 'atencion': return 'Atención (16-30d)';
            case 'mora_media': return 'Mora media (31-60d)';
            case 'mora_critica': return 'Mora crítica (>60d)';
        }
    }

    function abrirDetalleModal(v: VentaCobro) {
        ventaSeleccionadaModal = v;
    }

    function cerrarDetalleModal() {
        ventaSeleccionadaModal = null;
    }
</script>

<div class="cxc-report-page">
    <!-- Top Action Bar -->
    <div class="top-action-bar no-print">
        <GoBack route="/reportes" />

        <div class="header-actions">
            <button class="action-btn secondary" on:click={cargarDatos} title="Actualizar datos">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Actualizar</span>
            </button>
            <button class="action-btn secondary" on:click={exportarCSV} title="Exportar listado a archivo CSV / Excel">
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
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Auditoría Crediticia & Cobranzas
            </span>
            <h1>Reporte de Cuentas por Cobrar</h1>
            <p>Monitoreo en tiempo real de cartera exigible, estratificación de morosidad (Aging), concentración de riesgo crediticio y gestión activa de deudores.</p>
        </div>

        <!-- Filter Controls -->
        <div class="filter-strip no-print">
            <!-- Period Mode -->
            <div class="filter-group">
                <span class="filter-label">Alcance Temporal:</span>
                <div class="btn-group-segmented">
                    <button 
                        class:active={modoPeriodo === 'historico'} 
                        on:click={() => handlePeriodoChange('historico')}
                    >Toda la Cartera</button>
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

            <!-- Aging Filter -->
            <div class="filter-group">
                <label for="filter-mora">Tramo de Mora:</label>
                <div id="filter-mora" class="btn-group-segmented">
                    <button 
                        class:active={filtroMora === 'todos'} 
                        on:click={() => filtroMora = 'todos'}
                    >Todas ({ventasCobro.length})</button>
                    <button 
                        class:active={filtroMora === 'al_dia'} 
                        on:click={() => filtroMora = 'al_dia'}
                        title="0 a 15 días"
                    >Al día ({metricas.cantAlDia})</button>
                    <button 
                        class:active={filtroMora === 'atencion'} 
                        on:click={() => filtroMora = 'atencion'}
                        title="16 a 30 días"
                    >Atención ({metricas.cantAtencion})</button>
                    <button 
                        class:active={filtroMora === 'mora_media'} 
                        on:click={() => filtroMora = 'mora_media'}
                        title="31 a 60 días"
                    >Media ({metricas.cantMoraMedia})</button>
                    <button 
                        class:active={filtroMora === 'mora_critica'} 
                        on:click={() => filtroMora = 'mora_critica'}
                        title="Más de 60 días"
                    >Crítica ({metricas.cantMoraCritica})</button>
                </div>
            </div>

            <!-- Sorting Select -->
            <div class="filter-group ml-auto">
                <label for="sort-select">Ordenar por:</label>
                <select id="sort-select" bind:value={ordenSeleccionado} class="sort-select">
                    <option value="monto_desc">Mayor Deuda ($)</option>
                    <option value="monto_asc">Menor Deuda ($)</option>
                    <option value="antiguedad_desc">Más Antiguas (Prioridad)</option>
                    <option value="antiguedad_asc">Más Recientes</option>
                    <option value="cliente_asc">Cliente (A-Z)</option>
                </select>
            </div>
        </div>
    </header>

    {#if loading}
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Calculando cartera exigible y tramos de morosidad...</p>
        </div>
    {:else if error}
        <div class="error-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{error}</span>
        </div>
    {:else}
        <!-- 6 High-Impact Primary KPI Cards -->
        <section class="kpi-grid">
            <!-- 1. Total Cartera Exigible -->
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <span class="kpi-label">Cartera Total Exigible</span>
                    <div class="kpi-icon amber">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-amber">{formatCurrency(metricas.totalPorCobrar)}</div>
                <div class="kpi-footer">
                    <span class="kpi-sub"><strong>{metricas.cantVentasPendientes}</strong> comprobantes impagos</span>
                </div>
            </div>

            <!-- 2. Clientes Deudores -->
            <div class="kpi-card rose">
                <div class="kpi-top">
                    <span class="kpi-label">Clientes en Cartera</span>
                    <div class="kpi-icon rose">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-rose">{formatNumber(metricas.cantClientesDeudores)} <span class="kpi-unit">clientes</span></div>
                <div class="kpi-footer">
                    {#if metricas.clienteMayorDeuda}
                        <span class="kpi-sub truncate" title={metricas.clienteMayorDeuda.nombre}>
                            Mayor: <strong>{metricas.clienteMayorDeuda.nombre}</strong>
                        </span>
                    {:else}
                        <span class="kpi-sub">Sin deudores activos</span>
                    {/if}
                </div>
            </div>

            <!-- 3. Mora Crítica (> 60 días) -->
            <div class="kpi-card alert-red">
                <div class="kpi-top">
                    <span class="kpi-label">Mora Crítica (&gt; 60 días)</span>
                    <div class="kpi-icon red">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-red">{formatCurrency(metricas.montoMoraCritica)}</div>
                <div class="kpi-footer">
                    {#if metricas.montoMoraCritica > 0}
                        <span class="badge badge-danger">{metricas.pctCritico.toFixed(1)}% de la cartera</span>
                        <span class="kpi-sub">{metricas.cantMoraCritica} facturas</span>
                    {:else}
                        <span class="badge badge-success">0% en riesgo alto</span>
                        <span class="kpi-sub">Cartera saneada</span>
                    {/if}
                </div>
            </div>

            <!-- 4. Mora Moderada (31 a 60 días) -->
            <div class="kpi-card orange">
                <div class="kpi-top">
                    <span class="kpi-label">Mora Moderada (31 - 60 d)</span>
                    <div class="kpi-icon orange">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-orange">{formatCurrency(metricas.montoMoraMedia)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-warning">{metricas.cantMoraMedia} facturas</span>
                    <span class="kpi-sub">Acción preventiva</span>
                </div>
            </div>

            <!-- 5. Flujo Corriente (≤ 30 días) -->
            <div class="kpi-card emerald">
                <div class="kpi-top">
                    <span class="kpi-label">Corriente (≤ 30 días)</span>
                    <div class="kpi-icon emerald">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-emerald">{formatCurrency(metricas.montoAlDia + metricas.montoAtencion)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-success">{metricas.cantAlDia + metricas.cantAtencion} facturas</span>
                    <span class="kpi-sub">Flujo habitual</span>
                </div>
            </div>

            <!-- 6. Exposición y Ticket Promedio -->
            <div class="kpi-card indigo">
                <div class="kpi-top">
                    <span class="kpi-label">Ticket / Exposición Prom.</span>
                    <div class="kpi-icon indigo">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-indigo">{formatCurrency(metricas.ticketPromedioPendiente)}</div>
                <div class="kpi-footer">
                    <span class="kpi-sub">Prom. por cliente: <strong>{formatCurrency(metricas.deudaPromedioCliente)}</strong></span>
                </div>
            </div>
        </section>

        <!-- Aging Meter (Estratificación de Morosidad) -->
        <section class="aging-meter-section">
            <div class="section-header-compact">
                <div>
                    <h3>Estratificación de Morosidad (Aging de Saldos)</h3>
                    <p>Distribución porcentual de los saldos pendientes según sus días de antigüedad transcurridos.</p>
                </div>
                {#if metricas.totalPorCobrar > 0}
                    <div class="concentration-badge">
                        Top 3 Clientes concentran el <strong>{metricas.concentracionTop3Pct.toFixed(1)}%</strong> del riesgo
                    </div>
                {/if}
            </div>

            <!-- Visual Multi-segment Progress Bar -->
            <div class="multi-progress-bar">
                {#if metricas.totalPorCobrar > 0}
                    <div 
                        class="bar-segment al-dia" 
                        style="width: {(metricas.montoAlDia / metricas.totalPorCobrar) * 100}%"
                        title="Al día (0-15d): {formatCurrency(metricas.montoAlDia)}"
                    ></div>
                    <div 
                        class="bar-segment atencion" 
                        style="width: {(metricas.montoAtencion / metricas.totalPorCobrar) * 100}%"
                        title="Atención (16-30d): {formatCurrency(metricas.montoAtencion)}"
                    ></div>
                    <div 
                        class="bar-segment mora-media" 
                        style="width: {(metricas.montoMoraMedia / metricas.totalPorCobrar) * 100}%"
                        title="Mora media (31-60d): {formatCurrency(metricas.montoMoraMedia)}"
                    ></div>
                    <div 
                        class="bar-segment mora-critica" 
                        style="width: {(metricas.montoMoraCritica / metricas.totalPorCobrar) * 100}%"
                        title="Mora crítica (>60d): {formatCurrency(metricas.montoMoraCritica)}"
                    ></div>
                {:else}
                    <div class="bar-segment empty" style="width: 100%"></div>
                {/if}
            </div>

            <!-- 4 Interactive Aging Range Cards -->
            <div class="aging-cards-grid">
                <!-- 0 - 15 días -->
                <button 
                    class="aging-box al-dia" 
                    class:active={filtroMora === 'al_dia'}
                    on:click={() => filtroMora = filtroMora === 'al_dia' ? 'todos' : 'al_dia'}
                >
                    <div class="aging-box-top">
                        <span class="aging-dot al-dia"></span>
                        <span class="aging-range">0 a 15 días</span>
                        <span class="aging-badge">Al día</span>
                    </div>
                    <div class="aging-box-val">{formatCurrency(metricas.montoAlDia)}</div>
                    <div class="aging-box-sub">
                        <span>{metricas.cantAlDia} facturas</span>
                        <span>{metricas.totalPorCobrar > 0 ? ((metricas.montoAlDia / metricas.totalPorCobrar) * 100).toFixed(1) : 0}%</span>
                    </div>
                </button>

                <!-- 16 - 30 días -->
                <button 
                    class="aging-box atencion" 
                    class:active={filtroMora === 'atencion'}
                    on:click={() => filtroMora = filtroMora === 'atencion' ? 'todos' : 'atencion'}
                >
                    <div class="aging-box-top">
                        <span class="aging-dot atencion"></span>
                        <span class="aging-range">16 a 30 días</span>
                        <span class="aging-badge">Atención</span>
                    </div>
                    <div class="aging-box-val">{formatCurrency(metricas.montoAtencion)}</div>
                    <div class="aging-box-sub">
                        <span>{metricas.cantAtencion} facturas</span>
                        <span>{metricas.totalPorCobrar > 0 ? ((metricas.montoAtencion / metricas.totalPorCobrar) * 100).toFixed(1) : 0}%</span>
                    </div>
                </button>

                <!-- 31 - 60 días -->
                <button 
                    class="aging-box mora-media" 
                    class:active={filtroMora === 'mora_media'}
                    on:click={() => filtroMora = filtroMora === 'mora_media' ? 'todos' : 'mora_media'}
                >
                    <div class="aging-box-top">
                        <span class="aging-dot mora-media"></span>
                        <span class="aging-range">31 a 60 días</span>
                        <span class="aging-badge">Mora Media</span>
                    </div>
                    <div class="aging-box-val">{formatCurrency(metricas.montoMoraMedia)}</div>
                    <div class="aging-box-sub">
                        <span>{metricas.cantMoraMedia} facturas</span>
                        <span>{metricas.totalPorCobrar > 0 ? ((metricas.montoMoraMedia / metricas.totalPorCobrar) * 100).toFixed(1) : 0}%</span>
                    </div>
                </button>

                <!-- > 60 días -->
                <button 
                    class="aging-box mora-critica" 
                    class:active={filtroMora === 'mora_critica'}
                    on:click={() => filtroMora = filtroMora === 'mora_critica' ? 'todos' : 'mora_critica'}
                >
                    <div class="aging-box-top">
                        <span class="aging-dot mora-critica"></span>
                        <span class="aging-range">&gt; 60 días</span>
                        <span class="aging-badge danger">Crítica</span>
                    </div>
                    <div class="aging-box-val text-red">{formatCurrency(metricas.montoMoraCritica)}</div>
                    <div class="aging-box-sub">
                        <span>{metricas.cantMoraCritica} facturas</span>
                        <span>{metricas.totalPorCobrar > 0 ? ((metricas.montoMoraCritica / metricas.totalPorCobrar) * 100).toFixed(1) : 0}%</span>
                    </div>
                </button>
            </div>
        </section>

        <!-- Top Debtors (Concentración de Riesgo de Crédito) -->
        {#if topDeudores.length > 0}
            <section class="debtors-section">
                <div class="section-title">
                    <h2>Concentración de Deuda: Mayores Deudores</h2>
                    <p>Clientes con mayor exposición crediticia y deuda pendiente acumulada en el sistema.</p>
                </div>

                <div class="debtors-grid">
                    {#each topDeudores.slice(0, 4) as deudor, idx}
                        {@const waLink = getWhatsAppUrl(deudor, { cod: 'saldos pendientes' }, deudor.totalDeuda)}
                        <div class="debtor-card {idx === 0 ? 'top-one' : ''}">
                            <div class="debtor-header">
                                <div class="debtor-rank">#{idx + 1}</div>
                                <div class="debtor-info">
                                    <h4 class="debtor-name" title={deudor.nombre}>{deudor.nombre}</h4>
                                    <span class="debtor-contact">
                                        {#if deudor.telefono}
                                            <span>📞 {deudor.telefono}</span>
                                        {:else if deudor.email}
                                            <span>✉️ {deudor.email}</span>
                                        {:else}
                                            <span class="text-muted">Sin teléfono</span>
                                        {/if}
                                    </span>
                                </div>
                            </div>

                            <div class="debtor-body">
                                <div class="debtor-amount-row">
                                    <span class="debtor-lbl">Total Adeudado</span>
                                    <span class="debtor-val">{formatCurrency(deudor.totalDeuda)}</span>
                                </div>

                                <div class="debtor-progress-wrap">
                                    <div class="debtor-bar-bg">
                                        <div class="debtor-bar-fill" style="width: {Math.min(100, deudor.participacionPct)}%"></div>
                                    </div>
                                    <span class="debtor-pct">{deudor.participacionPct.toFixed(1)}% del total</span>
                                </div>

                                <div class="debtor-stats-row">
                                    <div class="d-stat">
                                        <span class="lbl">Comprobantes</span>
                                        <span class="val">{deudor.cantVentas}</span>
                                    </div>
                                    <div class="d-stat">
                                        <span class="lbl">Antigüedad Máx.</span>
                                        <span class="val font-mono">{deudor.diasMaxAntiguedad} d.</span>
                                    </div>
                                    <div class="d-stat">
                                        <span class="lbl">Riesgo</span>
                                        <span class="badge {deudor.peorCategoriaMora === 'mora_critica' ? 'badge-danger' : deudor.peorCategoriaMora === 'mora_media' ? 'badge-warning' : 'badge-info'}">
                                            {deudor.peorCategoriaMora === 'mora_critica' ? 'Crítico' : deudor.peorCategoriaMora === 'mora_media' ? 'Medio' : 'Normal'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="debtor-footer no-print">
                                {#if waLink}
                                    <a href={waLink} target="_blank" rel="noopener noreferrer" class="btn-whatsapp" title="Enviar recordatorio cordial por WhatsApp">
                                        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                        <span>Recordar Cobro</span>
                                    </a>
                                {:else}
                                    <button class="btn-search-client" on:click={() => busquedaCliente = deudor.nombre}>
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        <span>Filtrar Ventas</span>
                                    </button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Detailed Accounts Receivable Table Section -->
        <section class="table-section">
            <div class="table-section-header">
                <div>
                    <h2>Detalle Exhaustivo de Comprobantes Exigibles</h2>
                    <p>
                        Mostrando <strong>{ventasFiltradas.length}</strong> de {ventasCobro.length} cuentas por cobrar
                        {#if filtroMora !== 'todos'}
                            • Filtrado por: <span class="active-filter-label">{getMoraLabel(filtroMora)}</span>
                        {/if}
                    </p>
                </div>

                <div class="table-controls-right no-print">
                    <div class="search-wrap">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input 
                            type="text" 
                            bind:value={busquedaCliente} 
                            placeholder="Buscar cliente, comprobante o tel..." 
                        />
                        {#if busquedaCliente}
                            <button class="clear-search-btn" on:click={() => busquedaCliente = ""} title="Limpiar búsqueda">✕</button>
                        {/if}
                    </div>
                </div>
            </div>

            {#if ventasFiltradas.length === 0}
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3>¡No hay cuentas pendientes!</h3>
                    <p>No se encontraron comprobantes impagos para los filtros seleccionados.</p>
                    {#if filtroMora !== 'todos' || busquedaCliente}
                        <button class="btn-reset-filters" on:click={() => { filtroMora = 'todos'; busquedaCliente = ''; }}>
                            Restablecer Filtros
                        </button>
                    {/if}
                </div>
            {:else}
                <div class="table-responsive">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Comprobante</th>
                                <th>Cliente / Contacto</th>
                                <th>Emisión</th>
                                <th>Antigüedad</th>
                                <th>Nivel Mora</th>
                                <th class="text-right">Total Venta</th>
                                <th class="text-right">Pagado</th>
                                <th class="text-right">Saldo Exigible</th>
                                <th class="actions-header no-print text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each ventasFiltradas as item}
                                {@const waUrl = getWhatsAppUrl(item.cliente, item, item.saldoPendiente)}
                                <tr>
                                    <!-- Comprobante / Cod -->
                                    <td class="font-mono font-bold text-white">
                                        <button class="code-link" on:click={() => abrirDetalleModal(item)} title="Ver artículos de la venta">
                                            {item.cod}
                                        </button>
                                    </td>

                                    <!-- Cliente -->
                                    <td>
                                        <div class="client-cell">
                                            <span class="client-name">{item.clienteNombre}</span>
                                            {#if item.clienteTelefono || item.clienteEmail}
                                                <span class="client-sub">{item.clienteTelefono || item.clienteEmail}</span>
                                            {/if}
                                        </div>
                                    </td>

                                    <!-- Emisión -->
                                    <td class="font-mono text-muted">
                                        {formatDate(item.creadoEn)}
                                    </td>

                                    <!-- Antigüedad en días -->
                                    <td>
                                        <span class="days-pill font-mono">
                                            <strong>{item.diasAntiguedad}</strong> {item.diasAntiguedad === 1 ? 'día' : 'días'}
                                        </span>
                                    </td>

                                    <!-- Nivel de Mora Badge -->
                                    <td>
                                        {#if item.categoriaMora === 'al_dia'}
                                            <span class="badge badge-success">0-15d • Al día</span>
                                        {:else if item.categoriaMora === 'atencion'}
                                            <span class="badge badge-info">16-30d • Atención</span>
                                        {:else if item.categoriaMora === 'mora_media'}
                                            <span class="badge badge-warning">31-60d • Moderada</span>
                                        {:else}
                                            <span class="badge badge-danger">&gt;60d • Crítica</span>
                                        {/if}
                                    </td>

                                    <!-- Total Facturado -->
                                    <td class="text-right font-mono text-muted">
                                        {formatCurrency(item.total)}
                                    </td>

                                    <!-- Total Pagado Parcial -->
                                    <td class="text-right font-mono text-muted">
                                        {item.totalPagado > 0 ? formatCurrency(item.totalPagado) : '-'}
                                    </td>

                                    <!-- Saldo Pendiente (Destacado) -->
                                    <td class="text-right font-mono font-bold text-amber-glow">
                                        {formatCurrency(item.saldoPendiente)}
                                    </td>

                                    <!-- Acciones Rápidas -->
                                    <td class="no-print actions-col">
                                        <div class="row-actions">
                                            <!-- Botón Cobrar -->
                                            <ButtonPagar 
                                                name_entity="venta"
                                                label="Cobrar"
                                                route="ventas" 
                                                id={item.id} 
                                                {cajas}
                                                on:updated={cargarDatos}
                                            />

                                            <!-- Botón Detalles Modal -->
                                            <button 
                                                class="btn-row-action" 
                                                on:click={() => abrirDetalleModal(item)}
                                                title="Ver detalle de ítems de la venta"
                                            >
                                                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                <span>Ver</span>
                                            </button>

                                            <!-- Botón Recordatorio WhatsApp -->
                                            {#if waUrl}
                                                <a 
                                                    href={waUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    class="btn-row-action whatsapp" 
                                                    title="Enviar recordatorio de pago a {item.clienteNombre} por WhatsApp"
                                                >
                                                    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                                    <span>WhatsApp</span>
                                                </a>
                                            {/if}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Footer Summary Bar -->
                <div class="table-footer-summary">
                    <div class="summary-left">
                        <span>Total Comprobantes: <strong>{ventasFiltradas.length}</strong></span>
                        <span>• Clientes Afectados: <strong>{new Set(ventasFiltradas.map(v => v.clienteNombre)).size}</strong></span>
                    </div>
                    <div class="summary-right">
                        <span>Saldo Total Filtrado:</span>
                        <strong class="total-highlight">
                            {formatCurrency(ventasFiltradas.reduce((acc, v) => acc + v.saldoPendiente, 0))}
                        </strong>
                    </div>
                </div>
            {/if}
        </section>
    {/if}

    <!-- Modal Detalle de Ítems de la Venta -->
    {#if ventaSeleccionadaModal}
        <div 
            class="modal-overlay" 
            role="presentation"
            on:click={cerrarDetalleModal}
            on:keydown={(e) => e.key === 'Escape' && cerrarDetalleModal()}
        >
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div 
                class="modal-card" 
                role="dialog" 
                aria-modal="true" 
                aria-label="Detalle de Venta"
                tabindex="-1"
                on:click|stopPropagation
            >
                <div class="modal-header">
                    <div>
                        <span class="modal-badge">Detalle de Comprobante</span>
                        <h3>Venta {ventaSeleccionadaModal.cod}</h3>
                    </div>
                    <button class="modal-close-btn" on:click={cerrarDetalleModal} aria-label="Cerrar modal">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="modal-body">
                    <!-- Client & Meta Info -->
                    <div class="modal-info-grid">
                        <div class="modal-info-item">
                            <span class="label">Cliente</span>
                            <strong class="val">{ventaSeleccionadaModal.clienteNombre}</strong>
                        </div>
                        <div class="modal-info-item">
                            <span class="label">Contacto</span>
                            <span class="val">{ventaSeleccionadaModal.clienteContacto}</span>
                        </div>
                        <div class="modal-info-item">
                            <span class="label">Fecha de Emisión</span>
                            <span class="val">{formatDate(ventaSeleccionadaModal.creadoEn)}</span>
                        </div>
                        <div class="modal-info-item">
                            <span class="label">Antigüedad / Mora</span>
                            <span class="val font-bold text-amber">{ventaSeleccionadaModal.diasAntiguedad} días ({getMoraLabel(ventaSeleccionadaModal.categoriaMora)})</span>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="modal-table-wrap">
                        <h4 class="modal-table-title">Artículos / Líneas de la Venta</h4>
                        {#if !ventaSeleccionadaModal.linea_venta || ventaSeleccionadaModal.linea_venta.length === 0}
                            <p class="text-muted font-sm py-2">No hay líneas de detalle cargadas para esta venta.</p>
                        {:else}
                            <table class="modal-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th class="text-right">Cant.</th>
                                        <th class="text-right">Precio Unit.</th>
                                        <th class="text-right">Desc.</th>
                                        <th class="text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each ventaSeleccionadaModal.linea_venta as l}
                                        <tr>
                                            <td>
                                                <div class="prod-item">
                                                    <strong>{l.producto?.nombre || 'Producto'}</strong>
                                                    {#if l.producto?.cod}
                                                        <span class="prod-code-sub">{l.producto.cod}</span>
                                                    {/if}
                                                </div>
                                            </td>
                                            <td class="text-right font-mono">{l.cantidad}</td>
                                            <td class="text-right font-mono">{formatCurrency(Number(l.precio || 0))}</td>
                                            <td class="text-right font-mono text-muted">{Number(l.descuento || 0)}%</td>
                                            <td class="text-right font-mono font-bold">{formatCurrency(Number(l.subtotal || 0))}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {/if}
                    </div>

                    <!-- Total Balance Card -->
                    <div class="modal-financial-summary">
                        <div class="fin-row">
                            <span>Total Facturado:</span>
                            <strong class="font-mono">{formatCurrency(ventaSeleccionadaModal.total)}</strong>
                        </div>
                        <div class="fin-row">
                            <span>Total Pagado:</span>
                            <strong class="font-mono text-emerald">{formatCurrency(ventaSeleccionadaModal.totalPagado)}</strong>
                        </div>
                        <div class="fin-row highlight">
                            <span>Saldo Pendiente a Cobrar:</span>
                            <strong class="font-mono text-amber">{formatCurrency(ventaSeleccionadaModal.saldoPendiente)}</strong>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" on:click={() => goto(`/detalles/${ventaSeleccionadaModal.id}`)}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        <span>Administrar en Detalles</span>
                    </button>
                    <button class="btn-primary" on:click={cerrarDetalleModal}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .cxc-report-page {
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
        color: #fbbf24;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
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

    .sort-select {
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        font-size: 0.85rem;
        font-weight: 600;
        padding: 0.45rem 0.85rem;
        border-radius: var(--radius-md);
        outline: none;
        cursor: pointer;
    }

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

    .kpi-icon.amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .kpi-icon.rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
    .kpi-icon.red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .kpi-icon.orange { background: rgba(249, 115, 22, 0.15); color: #fb923c; }
    .kpi-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .kpi-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

    .kpi-value {
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #ffffff;
    }

    .kpi-unit {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-muted);
    }

    .text-amber { color: #fbbf24 !important; }
    .text-rose { color: #fb7185 !important; }
    .text-red { color: #f87171 !important; }
    .text-orange { color: #fb923c !important; }
    .text-emerald { color: #34d399 !important; }
    .text-indigo { color: #818cf8 !important; }
    .text-amber-glow { color: #facc15 !important; text-shadow: 0 0 12px rgba(250, 204, 21, 0.25); }

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

    .truncate {
        max-width: 160px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

    /* Aging Section */
    .aging-meter-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .section-header-compact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .section-header-compact h3 {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
    }

    .section-header-compact p {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .concentration-badge {
        font-size: 0.85rem;
        color: #fbbf24;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.25);
        padding: 0.35rem 0.85rem;
        border-radius: var(--radius-full);
    }

    .multi-progress-bar {
        width: 100%;
        height: 14px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-full);
        overflow: hidden;
        display: flex;
    }

    .bar-segment {
        height: 100%;
        transition: width 0.4s ease;
    }

    .bar-segment.al-dia { background: linear-gradient(90deg, #10b981 0%, #34d399 100%); }
    .bar-segment.atencion { background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%); }
    .bar-segment.mora-media { background: linear-gradient(90deg, #ea580c 0%, #fb923c 100%); }
    .bar-segment.mora-critica { background: linear-gradient(90deg, #dc2626 0%, #f87171 100%); }
    .bar-segment.empty { background: rgba(255, 255, 255, 0.08); }

    .aging-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
    }

    .aging-box {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.15rem;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .aging-box:hover {
        background: rgba(30, 41, 66, 0.7);
        border-color: var(--glass-border-hover);
        transform: translateY(-2px);
    }

    .aging-box.active {
        border-color: var(--color-brand);
        box-shadow: 0 0 0 2px var(--color-brand-glow);
        background: rgba(30, 41, 66, 0.9);
    }

    .aging-box-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .aging-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 0.4rem;
        display: inline-block;
    }

    .aging-dot.al-dia { background: #34d399; }
    .aging-dot.atencion { background: #38bdf8; }
    .aging-dot.mora-media { background: #fb923c; }
    .aging-dot.mora-critica { background: #f87171; }

    .aging-range {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-primary);
        flex: 1;
    }

    .aging-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.15rem 0.45rem;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-secondary);
    }

    .aging-badge.danger {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
    }

    .aging-box-val {
        font-size: 1.35rem;
        font-weight: 800;
        color: #ffffff;
        font-family: monospace;
    }

    .aging-box-sub {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;
        color: var(--text-muted);
    }

    /* Debtors Podium */
    .debtors-section {
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

    .debtors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
    }

    .debtor-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .debtor-card:hover {
        transform: translateY(-3px);
        border-color: var(--glass-border-hover);
        box-shadow: var(--shadow-md);
    }

    .debtor-card.top-one {
        border-color: rgba(245, 158, 11, 0.35);
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.7) 0%, rgba(245, 158, 11, 0.04) 100%);
    }

    .debtor-header {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
    }

    .debtor-rank {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-secondary);
        font-size: 0.85rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .debtor-card.top-one .debtor-rank {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .debtor-info {
        flex: 1;
        overflow: hidden;
    }

    .debtor-name {
        font-size: 1.1rem;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .debtor-contact {
        font-size: 0.8rem;
        color: var(--text-muted);
    }

    .debtor-body {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
    }

    .debtor-amount-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
    }

    .debtor-lbl {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--text-muted);
        font-weight: 700;
    }

    .debtor-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: #facc15;
        font-family: monospace;
    }

    .debtor-progress-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .debtor-bar-bg {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .debtor-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
        border-radius: var(--radius-full);
    }

    .debtor-pct {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-family: monospace;
        min-width: 65px;
        text-align: right;
    }

    .debtor-stats-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.65rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .d-stat {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .d-stat .lbl {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .d-stat .val {
        font-size: 0.95rem;
        font-weight: 700;
        color: #ffffff;
    }

    .debtor-footer {
        padding-top: 0.5rem;
    }

    .btn-whatsapp {
        width: 100%;
        background: rgba(37, 211, 102, 0.12);
        color: #25d366;
        border: 1px solid rgba(37, 211, 102, 0.25);
        padding: 0.5rem;
        border-radius: var(--radius-md);
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        text-decoration: none;
        transition: all var(--transition-fast);
    }

    .btn-whatsapp:hover {
        background: #25d366;
        color: #0b0f19;
    }

    .btn-search-client {
        width: 100%;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border: 1px solid var(--glass-border);
        padding: 0.5rem;
        border-radius: var(--radius-md);
        font-size: 0.82rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .btn-search-client:hover {
        background: var(--bg-tertiary);
        color: #ffffff;
    }

    /* Table Section */
    .table-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        box-shadow: var(--shadow-sm);
    }

    .table-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .table-section-header h2 {
        font-size: 1.35rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
    }

    .table-section-header p {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .active-filter-label {
        color: #fbbf24;
        font-weight: 700;
    }

    .search-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.45rem 0.85rem;
        color: var(--text-muted);
        position: relative;
    }

    .search-wrap input {
        background: transparent;
        border: none;
        padding: 0;
        outline: none;
        color: var(--text-primary);
        font-size: 0.88rem;
        width: 240px;
    }

    .clear-search-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        font-size: 0.85rem;
    }

    .clear-search-btn:hover {
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

    .code-link {
        background: transparent;
        border: none;
        color: #818cf8;
        font-family: monospace;
        font-weight: 700;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color var(--transition-fast);
    }

    .code-link:hover {
        color: #a5b4fc;
    }

    .client-cell {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .client-name {
        font-weight: 600;
        color: #ffffff;
    }

    .client-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
    }

    .days-pill {
        font-size: 0.82rem;
        color: var(--text-secondary);
        background: rgba(255, 255, 255, 0.04);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .row-actions {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
    }

    .btn-row-action {
        background: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        padding: 0.4rem 0.65rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        text-decoration: none;
        transition: all var(--transition-fast);
    }

    .btn-row-action:hover {
        background: var(--color-brand-glow);
        color: var(--color-brand);
        border-color: var(--color-brand);
    }

    .btn-row-action.whatsapp {
        background: rgba(37, 211, 102, 0.1);
        border-color: rgba(37, 211, 102, 0.25);
        color: #25d366;
    }

    .btn-row-action.whatsapp:hover {
        background: #25d366;
        color: #0b0f19;
    }

    .table-footer-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        padding-top: 1.25rem;
        border-top: 1px solid var(--glass-border);
        font-size: 0.9rem;
    }

    .summary-left {
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .summary-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-secondary);
    }

    .total-highlight {
        font-size: 1.25rem;
        color: #facc15;
        font-family: monospace;
    }

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        padding: 1.5rem;
        animation: fadeIn 0.15s ease-out;
    }

    .modal-card {
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border-hover);
        border-radius: var(--radius-lg);
        width: 100%;
        max-width: 650px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 2rem;
        box-shadow: var(--shadow-lg);
        animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 1rem;
    }

    .modal-badge {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #818cf8;
        letter-spacing: 0.05em;
    }

    .modal-header h3 {
        font-size: 1.4rem;
        font-weight: 800;
        color: #ffffff;
    }

    .modal-close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.2rem;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast);
    }

    .modal-close-btn:hover {
        color: #ffffff;
    }

    .modal-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.25rem;
    }

    .modal-info-item {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .modal-info-item .label {
        font-size: 0.72rem;
        text-transform: uppercase;
        color: var(--text-muted);
        font-weight: 700;
    }

    .modal-info-item .val {
        font-size: 0.95rem;
        color: #ffffff;
    }

    .modal-table-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .modal-table-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #ffffff;
    }

    .modal-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
    }

    .modal-table th {
        text-align: left;
        padding: 0.6rem 0.75rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
        border-bottom: 1px solid var(--glass-border);
    }

    .modal-table td {
        padding: 0.65rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        color: var(--text-primary);
    }

    .prod-item {
        display: flex;
        flex-direction: column;
    }

    .prod-code-sub {
        font-size: 0.72rem;
        color: var(--text-muted);
        font-family: monospace;
    }

    .modal-financial-summary {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .fin-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .fin-row.highlight {
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 1.05rem;
        font-weight: 700;
        color: #ffffff;
    }

    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        border-top: 1px solid var(--glass-border);
        padding-top: 1.25rem;
    }

    .btn-secondary {
        background: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        padding: 0.6rem 1.15rem;
        border-radius: var(--radius-md);
        font-size: 0.88rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .btn-secondary:hover {
        background: var(--bg-primary);
        color: #ffffff;
    }

    .btn-primary {
        background: var(--color-brand);
        color: #ffffff;
        border: none;
        padding: 0.6rem 1.25rem;
        border-radius: var(--radius-md);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .btn-primary:hover {
        background: var(--color-brand-hover);
    }

    /* Common Utilities */
    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-sm { font-size: 0.8rem; }
    .text-muted { color: var(--text-muted) !important; }
    .text-white { color: #ffffff !important; }

    .empty-state {
        text-align: center;
        padding: 4rem 1rem;
        color: var(--text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .empty-state-icon {
        color: #34d399;
        background: rgba(16, 185, 129, 0.1);
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .empty-state h3 {
        font-size: 1.25rem;
        color: #ffffff;
    }

    .btn-reset-filters {
        margin-top: 0.5rem;
        background: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-reset-filters:hover {
        color: #ffffff;
        background: var(--color-brand);
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

        .cxc-report-page {
            max-width: 100% !important;
            padding: 0 !important;
            color: #000000 !important;
        }

        .report-header-banner, .kpi-card, .aging-meter-section, .debtor-card, .table-section {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            break-inside: avoid;
        }

        .header-content h1, .section-title h2, .table-section-header h2, .kpi-value, .debtor-name, .client-name {
            color: #000000 !important;
        }

        .kpi-label, .report-table th, .text-muted, .aging-range {
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

        .total-highlight {
            color: #000000 !important;
        }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .cxc-report-page {
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

        .sort-select {
            width: 100%;
        }

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .aging-cards-grid {
            grid-template-columns: 1fr;
        }

        .debtors-grid {
            grid-template-columns: 1fr;
        }

        .search-wrap {
            width: 100%;
        }

        .search-wrap input {
            width: 100%;
        }
    }
</style>
