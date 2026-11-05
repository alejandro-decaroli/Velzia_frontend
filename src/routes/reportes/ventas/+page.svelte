<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchEntity, getDetallesByUser } from '$lib/utils/api.js';
    import GoBack from "$lib/components/goback.svelte";
    import { checkUser, user } from "$lib/stores/auth.js";

    let error: string | null = null;
    let loading = true;
    let ventas: any[] = [];
    let detalles: any[] = [];

    // Filtros interactivos
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    let selectedMes: string = currentMonthStr;
    let filtroEstado: string = "todos"; // "todos", "pagadas", "pendientes"
    let busquedaProducto: string = "";

    // Métricas calculadas
    let metricas = {
        totalFacturado: 0,
        totalCobrado: 0,
        totalPendiente: 0,
        cantVentas: 0,
        cantPagadas: 0,
        cantPendientes: 0,
        tasaCobroPct: 0,
        ticketPromedio: 0,
        unidadesTotales: 0,
        descuentoTotal: 0,
        costoTotalEstimado: 0,
        gananciaBrutaEstimada: 0,
        margenBrutoPct: 0
    };

    interface ProductoResumen {
        id: number | string;
        nombre: string;
        cod: string;
        cantidad: number;
        facturacion: number;
        costoTotal: number;
        gananciaBruta: number;
        margenPct: number;
        precioPromedio: number;
        participacionPct: number;
    }

    interface ClienteResumen {
        id: number | string;
        nombre: string;
        email: string;
        telefono: string;
        comprasCount: number;
        totalFacturado: number;
        totalPagado: number;
        totalPendiente: number;
        ticketPromedio: number;
    }

    let rankingProductos: ProductoResumen[] = [];
    let rankingClientes: ClienteResumen[] = [];

    let productoMasVendido: ProductoResumen | null = null;
    let productoMayorFacturacion: ProductoResumen | null = null;
    let productoMayorGanancia: ProductoResumen | null = null;
    let productoMenorRotacion: ProductoResumen | null = null;

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        await cargarDatos();
    });

    async function cargarDatos() {
        loading = true;
        error = null;
        try {
            // El backend filtra por mes según la fecha enviada
            const fechaParam = selectedMes ? `${selectedMes}-01` : "";
            
            const [resVentas, resDetalles] = await Promise.all([
                fetchEntity("ventas", [], false, null, "", fechaParam),
                getDetallesByUser([], false, null)
            ]);

            ventas = resVentas.entities || [];
            detalles = resDetalles.entities || [];

            recalcularMetricas();
        } catch (e: any) {
            error = e.message || "Error al cargar reporte de ventas";
        } finally {
            loading = false;
        }
    }

    function recalcularMetricas() {
        // Filtrar ventas por estado si corresponde
        let ventasFiltradas = [...ventas];
        if (filtroEstado === "pagadas") {
            ventasFiltradas = ventasFiltradas.filter(v => ['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos'].includes(v.estado));
        } else if (filtroEstado === "pendientes") {
            ventasFiltradas = ventasFiltradas.filter(v => ['Pendiente', 'pendiente'].includes(v.estado));
        }

        const idsVentasFiltradas = new Set(ventasFiltradas.map(v => v.id));

        // Filtrar detalles asociados a las ventas activas en el período
        let detallesFiltrados = detalles.filter(d => {
            const vId = d.venta?.id || d.venta;
            return idsVentasFiltradas.has(vId);
        });

        // Totales de facturación y cobranza
        let facturado = 0;
        let cobrado = 0;
        let pendiente = 0;
        let pagadasCount = 0;
        let pendientesCount = 0;

        ventasFiltradas.forEach(v => {
            const tot = Number(v.total || 0);
            facturado += tot;
            const esPaga = ['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos'].includes(v.estado);
            if (esPaga) {
                pagadasCount++;
                cobrado += tot;
            } else {
                pendientesCount++;
                const pagadoParcial = Number(v.total_pagado || 0);
                cobrado += pagadoParcial;
                pendiente += Math.max(0, tot - pagadoParcial);
            }
        });

        // Totales de unidades, costos y descuentos
        let unidades = 0;
        let descuentosAcum = 0;
        let costoTotal = 0;

        const prodMap: Record<string, ProductoResumen> = {};

        detallesFiltrados.forEach(d => {
            const cant = Number(d.cantidad || 0);
            const sub = Number(d.subtotal || 0);
            const prec = Number(d.precio || 0);
            const desc = Number(d.descuento || 0);
            const costoUnit = Number(d.producto?.costo_actual || 0);

            unidades += cant;
            costoTotal += cant * costoUnit;
            descuentosAcum += (cant * prec) * (desc / 100);

            const prodId = d.producto?.id || d.producto?.cod || d.producto?.nombre || 'desconocido';
            const prodNombre = d.producto?.nombre || 'Producto';
            const prodCod = d.producto?.cod || '';

            if (!prodMap[prodId]) {
                prodMap[prodId] = {
                    id: prodId,
                    nombre: prodNombre,
                    cod: prodCod,
                    cantidad: 0,
                    facturacion: 0,
                    costoTotal: 0,
                    gananciaBruta: 0,
                    margenPct: 0,
                    precioPromedio: prec,
                    participacionPct: 0
                };
            }

            prodMap[prodId].cantidad += cant;
            prodMap[prodId].facturacion += sub;
            prodMap[prodId].costoTotal += (cant * costoUnit);
        });

        const productosList = Object.values(prodMap).map(p => {
            p.gananciaBruta = p.facturacion - p.costoTotal;
            p.margenPct = p.facturacion > 0 ? (p.gananciaBruta / p.facturacion) * 100 : 0;
            p.participacionPct = facturado > 0 ? (p.facturacion / facturado) * 100 : 0;
            p.precioPromedio = p.cantidad > 0 ? p.facturacion / p.cantidad : 0;
            return p;
        });

        // Ordenar por facturación descendente
        productosList.sort((a, b) => b.facturacion - a.facturacion);
        rankingProductos = productosList;

        // Podio de productos
        if (productosList.length > 0) {
            productoMayorFacturacion = [...productosList].sort((a, b) => b.facturacion - a.facturacion)[0];
            productoMasVendido = [...productosList].sort((a, b) => b.cantidad - a.cantidad)[0];
            productoMayorGanancia = [...productosList].sort((a, b) => b.gananciaBruta - a.gananciaBruta)[0];
            productoMenorRotacion = [...productosList].sort((a, b) => a.cantidad - b.cantidad)[0];
        } else {
            productoMayorFacturacion = null;
            productoMasVendido = null;
            productoMayorGanancia = null;
            productoMenorRotacion = null;
        }

        // Agrupación por Cliente
        const clientMap: Record<string, ClienteResumen> = {};
        ventasFiltradas.forEach(v => {
            const cId = v.cliente?.id || 'sin_cliente';
            const cNombre = v.cliente ? `${v.cliente.nombre || ''} ${v.cliente.apellido || ''}`.trim() || 'Cliente Sin Nombre' : 'Consumidor Final';
            const cEmail = v.cliente?.email || '-';
            const cTel = v.cliente?.telefono || '-';
            const tot = Number(v.total || 0);
            const esPaga = ['Paga', 'Pagada', 'Pagado', 'Pago', 'pagos'].includes(v.estado);

            if (!clientMap[cId]) {
                clientMap[cId] = {
                    id: cId,
                    nombre: cNombre,
                    email: cEmail,
                    telefono: cTel,
                    comprasCount: 0,
                    totalFacturado: 0,
                    totalPagado: 0,
                    totalPendiente: 0,
                    ticketPromedio: 0
                };
            }

            clientMap[cId].comprasCount += 1;
            clientMap[cId].totalFacturado += tot;
            if (esPaga) {
                clientMap[cId].totalPagado += tot;
            } else {
                const pagoParcial = Number(v.total_pagado || 0);
                clientMap[cId].totalPagado += pagoParcial;
                clientMap[cId].totalPendiente += Math.max(0, tot - pagoParcial);
            }
        });

        const clientesList = Object.values(clientMap).map(c => {
            c.ticketPromedio = c.comprasCount > 0 ? c.totalFacturado / c.comprasCount : 0;
            return c;
        });
        clientesList.sort((a, b) => b.totalFacturado - a.totalFacturado);
        rankingClientes = clientesList;

        // Métricas consolidadas
        const gananciaBruta = facturado - costoTotal;
        metricas = {
            totalFacturado: facturado,
            totalCobrado: cobrado,
            totalPendiente: pendiente,
            cantVentas: ventasFiltradas.length,
            cantPagadas: pagadasCount,
            cantPendientes: pendientesCount,
            tasaCobroPct: facturado > 0 ? (cobrado / facturado) * 100 : 0,
            ticketPromedio: ventasFiltradas.length > 0 ? facturado / ventasFiltradas.length : 0,
            unidadesTotales: unidades,
            descuentoTotal: descuentosAcum,
            costoTotalEstimado: costoTotal,
            gananciaBrutaEstimada: gananciaBruta,
            margenBrutoPct: facturado > 0 ? (gananciaBruta / facturado) * 100 : 0
        };
    }

    function handleMesChange() {
        cargarDatos();
    }

    function handleEstadoChange(nuevoEstado: string) {
        filtroEstado = nuevoEstado;
        recalcularMetricas();
    }

    function printReport() {
        window.print();
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

    $: productosFiltrados = rankingProductos.filter(p => {
        if (!busquedaProducto) return true;
        const q = busquedaProducto.toLowerCase();
        return p.nombre.toLowerCase().includes(q) || (p.cod && p.cod.toLowerCase().includes(q));
    });
</script>

<div class="sales-report-page">
    <!-- Top Action Bar -->
    <div class="top-action-bar no-print">
        <GoBack route="/reportes" />

        <div class="header-actions">
            <button class="action-btn secondary" on:click={cargarDatos} title="Actualizar datos">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Actualizar</span>
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
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
                Auditoría Comercial & Rentabilidad
            </span>
            <h1>Reporte Integral de Ventas</h1>
            <p>Análisis de facturación, efectividad de cobranzas, márgenes brutos estimados y comportamiento de la demanda.</p>
        </div>

        <!-- Filter Controls -->
        <div class="filter-strip no-print">
            <div class="filter-group">
                <label for="mes-selector">Período Mensual:</label>
                <input 
                    type="month" 
                    id="mes-selector"
                    bind:value={selectedMes} 
                    on:change={handleMesChange} 
                />
            </div>

            <div class="filter-group">
                <label for="filter-estado">Estado de Ventas:</label>
                <div id="filter-estado" class="btn-group-segmented">
                    <button 
                        class:active={filtroEstado === 'todos'} 
                        on:click={() => handleEstadoChange('todos')}
                    >Todas</button>
                    <button 
                        class:active={filtroEstado === 'pagadas'} 
                        on:click={() => handleEstadoChange('pagadas')}
                    >Pagadas</button>
                    <button 
                        class:active={filtroEstado === 'pendientes'} 
                        on:click={() => handleEstadoChange('pendientes')}
                    >Pendientes</button>
                </div>
            </div>
        </div>
    </header>

    {#if loading}
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Calculando métricas comerciales y márgenes...</p>
        </div>
    {:else if error}
        <div class="error-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{error}</span>
        </div>
    {:else}
        <!-- 6 High-Impact Primary KPI Cards -->
        <section class="kpi-grid">
            <!-- 1. Total Facturado -->
            <div class="kpi-card brand">
                <div class="kpi-top">
                    <span class="kpi-label">Facturación Bruta Total</span>
                    <div class="kpi-icon brand">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value">{formatCurrency(metricas.totalFacturado)}</div>
                <div class="kpi-footer">
                    <span class="kpi-sub"><strong>{metricas.cantVentas}</strong> operaciones registradas</span>
                </div>
            </div>

            <!-- 2. Total Cobrado Efectivo -->
            <div class="kpi-card emerald">
                <div class="kpi-top">
                    <span class="kpi-label">Cobranzas Efectivas</span>
                    <div class="kpi-icon emerald">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-emerald">{formatCurrency(metricas.totalCobrado)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-success">{metricas.tasaCobroPct.toFixed(1)}% cobrado</span>
                    <span class="kpi-sub">{metricas.cantPagadas} ventas saldadas</span>
                </div>
            </div>

            <!-- 3. Cuentas Pendientes por Cobrar -->
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <span class="kpi-label">Pendiente por Cobrar</span>
                    <div class="kpi-icon amber">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-amber">{formatCurrency(metricas.totalPendiente)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-warning">{(100 - metricas.tasaCobroPct).toFixed(1)}% por cobrar</span>
                    <span class="kpi-sub">{metricas.cantPendientes} ventas a cobrar</span>
                </div>
            </div>

            <!-- 4. Margen / Ganancia Bruta Estimada -->
            <div class="kpi-card purple">
                <div class="kpi-top">
                    <span class="kpi-label">Ganancia Bruta Estimada</span>
                    <div class="kpi-icon purple">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                </div>
                <div class="kpi-value text-purple">{formatCurrency(metricas.gananciaBrutaEstimada)}</div>
                <div class="kpi-footer">
                    <span class="badge badge-purple">Margen {metricas.margenBrutoPct.toFixed(1)}%</span>
                    <span class="kpi-sub">Costo: {formatCurrency(metricas.costoTotalEstimado)}</span>
                </div>
            </div>

            <!-- 5. Ticket Promedio -->
            <div class="kpi-card sky">
                <div class="kpi-top">
                    <span class="kpi-label">Ticket Promedio</span>
                    <div class="kpi-icon sky">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    </div>
                </div>
                <div class="kpi-value">{formatCurrency(metricas.ticketPromedio)}</div>
                <div class="kpi-footer">
                    <span class="kpi-sub">Promedio por comprobante emitido</span>
                </div>
            </div>

            <!-- 6. Unidades y Descuentos -->
            <div class="kpi-card rose">
                <div class="kpi-top">
                    <span class="kpi-label">Unidades & Descuentos</span>
                    <div class="kpi-icon rose">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                </div>
                <div class="kpi-value">{formatNumber(metricas.unidadesTotales)} <span class="kpi-unit">u.</span></div>
                <div class="kpi-footer">
                    <span class="kpi-sub">Desc. otorgados: <strong>{formatCurrency(metricas.descuentoTotal)}</strong></span>
                </div>
            </div>
        </section>

        <!-- Visual Cash Collection Progress Bar -->
        <section class="collection-meter-section">
            <div class="section-header-compact">
                <div>
                    <h3>Composición de Cobranza del Período</h3>
                    <p>Relación entre importes cobrados en caja y montos exigibles pendientes</p>
                </div>
                <span class="ratio-badge">{metricas.tasaCobroPct.toFixed(1)}% Efectividad</span>
            </div>

            <div class="multi-progress-bar">
                <div 
                    class="bar-segment cobrado" 
                    style="width: {Math.min(100, Math.max(0, metricas.tasaCobroPct))}%"
                    title="Cobrado: {formatCurrency(metricas.totalCobrado)}"
                ></div>
                <div 
                    class="bar-segment pendiente" 
                    style="width: {Math.min(100, Math.max(0, 100 - metricas.tasaCobroPct))}%"
                    title="Pendiente: {formatCurrency(metricas.totalPendiente)}"
                ></div>
            </div>

            <div class="meter-legend">
                <div class="legend-item">
                    <span class="legend-dot cobrado"></span>
                    <span>Cobrado: <strong>{formatCurrency(metricas.totalCobrado)}</strong> ({metricas.cantPagadas} ventas)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot pendiente"></span>
                    <span>Pendiente: <strong>{formatCurrency(metricas.totalPendiente)}</strong> ({metricas.cantPendientes} ventas)</span>
                </div>
            </div>
        </section>

        <!-- Product Podium & Highlights -->
        <section class="podium-section">
            <div class="section-title">
                <h2>Podio de Productos</h2>
                <p>Comportamiento de la demanda y productos con mayor y menor rendimiento</p>
            </div>

            <div class="podium-grid">
                <!-- 1. Más vendido (Volumen) -->
                <div class="podium-card gold">
                    <div class="podium-badge">🏆 Más Vendido (Volumen)</div>
                    {#if productoMasVendido}
                        <h4 class="podium-prod-name">{productoMasVendido.nombre}</h4>
                        <span class="podium-prod-code">{productoMasVendido.cod || '-'}</span>
                        <div class="podium-metrics">
                            <div class="podium-m-item">
                                <span class="label">Unidades</span>
                                <span class="val highlight">{formatNumber(productoMasVendido.cantidad)}</span>
                            </div>
                            <div class="podium-m-item">
                                <span class="label">Facturado</span>
                                <span class="val">{formatCurrency(productoMasVendido.facturacion)}</span>
                            </div>
                        </div>
                    {:else}
                        <p class="text-muted">Sin registros suficientes</p>
                    {/if}
                </div>

                <!-- 2. Mayor Facturación -->
                <div class="podium-card diamond">
                    <div class="podium-badge">💎 Mayor Facturación</div>
                    {#if productoMayorFacturacion}
                        <h4 class="podium-prod-name">{productoMayorFacturacion.nombre}</h4>
                        <span class="podium-prod-code">{productoMayorFacturacion.cod || '-'}</span>
                        <div class="podium-metrics">
                            <div class="podium-m-item">
                                <span class="label">Ingresos</span>
                                <span class="val highlight">{formatCurrency(productoMayorFacturacion.facturacion)}</span>
                            </div>
                            <div class="podium-m-item">
                                <span class="label">Participación</span>
                                <span class="val">{productoMayorFacturacion.participacionPct.toFixed(1)}% del total</span>
                            </div>
                        </div>
                    {:else}
                        <p class="text-muted">Sin registros suficientes</p>
                    {/if}
                </div>

                <!-- 3. Mayor Ganancia Bruta -->
                <div class="podium-card emerald">
                    <div class="podium-badge">📈 Mayor Rentabilidad ($)</div>
                    {#if productoMayorGanancia}
                        <h4 class="podium-prod-name">{productoMayorGanancia.nombre}</h4>
                        <span class="podium-prod-code">{productoMayorGanancia.cod || '-'}</span>
                        <div class="podium-metrics">
                            <div class="podium-m-item">
                                <span class="label">Ganancia Neta</span>
                                <span class="val highlight text-emerald">{formatCurrency(productoMayorGanancia.gananciaBruta)}</span>
                            </div>
                            <div class="podium-m-item">
                                <span class="label">Margen</span>
                                <span class="val">{productoMayorGanancia.margenPct.toFixed(1)}%</span>
                            </div>
                        </div>
                    {:else}
                        <p class="text-muted">Sin registros suficientes</p>
                    {/if}
                </div>

                <!-- 4. Menor Rotación -->
                <div class="podium-card warning">
                    <div class="podium-badge">⚠️ Menor Rotación</div>
                    {#if productoMenorRotacion}
                        <h4 class="podium-prod-name">{productoMenorRotacion.nombre}</h4>
                        <span class="podium-prod-code">{productoMenorRotacion.cod || '-'}</span>
                        <div class="podium-metrics">
                            <div class="podium-m-item">
                                <span class="label">Unidades</span>
                                <span class="val highlight text-amber">{formatNumber(productoMenorRotacion.cantidad)}</span>
                            </div>
                            <div class="podium-m-item">
                                <span class="label">Ingresos</span>
                                <span class="val">{formatCurrency(productoMenorRotacion.facturacion)}</span>
                            </div>
                        </div>
                    {:else}
                        <p class="text-muted">Sin registros suficientes</p>
                    {/if}
                </div>
            </div>
        </section>

        <!-- Detailed Product Ranking Table -->
        <section class="table-section">
            <div class="table-section-header">
                <div>
                    <h2>Desglose de Rendimiento por Producto</h2>
                    <p>Detalle exhaustivo de rotación, precios promedio, margen comercial y aportes a la facturación</p>
                </div>
                <div class="search-wrap no-print">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        bind:value={busquedaProducto} 
                        placeholder="Buscar producto o código..." 
                    />
                </div>
            </div>

            {#if productosFiltrados.length === 0}
                <div class="empty-state">
                    <p>No se registraron ventas de productos para el filtro seleccionado.</p>
                </div>
            {:else}
                <div class="table-responsive">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th class="text-right">Unidades</th>
                                <th class="text-right">Precio Prom.</th>
                                <th class="text-right">Costo Est.</th>
                                <th class="text-right">Facturación</th>
                                <th class="text-right">Ganancia Est.</th>
                                <th class="text-right">Margen</th>
                                <th style="min-width: 140px;">Participación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each productosFiltrados as item, idx}
                                <tr>
                                    <td class="rank-cell">{idx + 1}</td>
                                    <td>
                                        <div class="prod-cell">
                                            <span class="prod-name">{item.nombre}</span>
                                            {#if item.cod}
                                                <span class="prod-code-tag">{item.cod}</span>
                                            {/if}
                                        </div>
                                    </td>
                                    <td class="text-right font-mono font-bold">{formatNumber(item.cantidad)}</td>
                                    <td class="text-right font-mono">{formatCurrency(item.precioPromedio)}</td>
                                    <td class="text-right font-mono text-muted">{formatCurrency(item.costoTotal / (item.cantidad || 1))}</td>
                                    <td class="text-right font-mono font-bold">{formatCurrency(item.facturacion)}</td>
                                    <td class="text-right font-mono text-emerald font-bold">
                                        {formatCurrency(item.gananciaBruta)}
                                    </td>
                                    <td class="text-right">
                                        <span class="badge {item.margenPct >= 30 ? 'badge-success' : 'badge-warning'}">
                                            {item.margenPct.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td>
                                        <div class="share-cell">
                                            <div class="mini-progress">
                                                <div class="mini-bar" style="width: {Math.min(100, item.participacionPct)}%"></div>
                                            </div>
                                            <span class="share-label">{item.participacionPct.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </section>

        <!-- Top Clients Ranking Section -->
        <section class="table-section">
            <div class="table-section-header">
                <div>
                    <h2>Top Clientes del Período</h2>
                    <p>Clientes con mayor volumen de compra y comportamiento de pago</p>
                </div>
            </div>

            {#if rankingClientes.length === 0}
                <div class="empty-state">
                    <p>No hay compras de clientes registradas en este período.</p>
                </div>
            {:else}
                <div class="table-responsive">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Contacto</th>
                                <th class="text-right">Compras</th>
                                <th class="text-right">Ticket Prom.</th>
                                <th class="text-right">Total Facturado</th>
                                <th class="text-right">Cobrado</th>
                                <th class="text-right">Pendiente</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each rankingClientes.slice(0, 8) as cliente, idx}
                                <tr>
                                    <td class="rank-cell">{idx + 1}</td>
                                    <td>
                                        <span class="client-name">{cliente.nombre}</span>
                                    </td>
                                    <td class="text-muted font-sm">
                                        {cliente.email !== '-' ? cliente.email : cliente.telefono}
                                    </td>
                                    <td class="text-right font-mono font-bold">{cliente.comprasCount}</td>
                                    <td class="text-right font-mono">{formatCurrency(cliente.ticketPromedio)}</td>
                                    <td class="text-right font-mono font-bold">{formatCurrency(cliente.totalFacturado)}</td>
                                    <td class="text-right font-mono text-emerald">{formatCurrency(cliente.totalPagado)}</td>
                                    <td class="text-right font-mono text-amber">
                                        {cliente.totalPendiente > 0 ? formatCurrency(cliente.totalPendiente) : '-'}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </section>
    {/if}
</div>

<style>
    .sales-report-page {
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

    .report-header-banner {
        background: linear-gradient(135deg, rgba(30, 41, 66, 0.5) 0%, rgba(19, 27, 46, 0.8) 100%);
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
        color: #818cf8;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
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
        max-width: 750px;
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

    .filter-group label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
    }

    .filter-group input[type="month"] {
        padding: 0.5rem 0.85rem;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 0.9rem;
        font-weight: 600;
        outline: none;
    }

    .btn-group-segmented {
        display: inline-flex;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.2rem;
    }

    .btn-group-segmented button {
        background: transparent;
        color: var(--text-secondary);
        padding: 0.4rem 0.9rem;
        border-radius: var(--radius-sm);
        font-size: 0.82rem;
        font-weight: 600;
        transition: all var(--transition-fast);
    }

    .btn-group-segmented button.active {
        background: var(--color-brand);
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
        font-size: 0.78rem;
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
    .kpi-icon.sky { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
    .kpi-icon.rose { background: rgba(244, 63, 94, 0.15); color: #fb7185; }

    .kpi-value {
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #ffffff;
    }

    .kpi-unit {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-muted);
    }

    .text-emerald { color: #34d399 !important; }
    .text-amber { color: #fbbf24 !important; }
    .text-purple { color: #c084fc !important; }

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

    .badge-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.25);
    }

    .badge-purple {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.25);
    }

    /* Cash Collection Meter */
    .collection-meter-section {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.75rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section-header-compact {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

    .ratio-badge {
        font-size: 0.85rem;
        font-weight: 700;
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
    }

    .multi-progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-full);
        overflow: hidden;
        display: flex;
    }

    .bar-segment.cobrado {
        background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
        transition: width 0.4s ease;
    }

    .bar-segment.pendiente {
        background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
        transition: width 0.4s ease;
    }

    .meter-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    .legend-dot.cobrado { background: #34d399; }
    .legend-dot.pendiente { background: #fbbf24; }

    /* Podium Section */
    .podium-section {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .section-title h2 {
        font-size: 1.4rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .section-title p {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .podium-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.25rem;
    }

    .podium-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .podium-card:hover {
        transform: translateY(-3px);
        border-color: var(--glass-border-hover);
        box-shadow: var(--shadow-md);
    }

    .podium-badge {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        width: fit-content;
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
    }

    .podium-card.gold .podium-badge {
        background: rgba(251, 191, 36, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(251, 191, 36, 0.25);
    }

    .podium-card.diamond .podium-badge {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        border: 1px solid rgba(99, 102, 241, 0.25);
    }

    .podium-card.emerald .podium-badge {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .podium-card.warning .podium-badge {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.25);
    }

    .podium-prod-name {
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
        margin-top: 0.25rem;
    }

    .podium-prod-code {
        font-size: 0.78rem;
        color: var(--text-muted);
        font-family: monospace;
    }

    .podium-metrics {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .podium-m-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .podium-m-item .label {
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
    }

    .podium-m-item .val {
        font-size: 1.05rem;
        font-weight: 700;
        color: #ffffff;
    }

    .podium-m-item .val.highlight {
        color: #818cf8;
    }

    /* Table Sections */
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

    .search-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-md);
        padding: 0.45rem 0.85rem;
        color: var(--text-muted);
    }

    .search-wrap input {
        background: transparent;
        border: none;
        padding: 0;
        outline: none;
        color: var(--text-primary);
        font-size: 0.88rem;
        width: 200px;
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
    }

    .report-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    .rank-cell {
        font-weight: 700;
        color: var(--text-muted);
        width: 40px;
    }

    .prod-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .prod-name {
        font-weight: 600;
        color: #ffffff;
    }

    .prod-code-tag {
        font-size: 0.72rem;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.05);
        padding: 0.15rem 0.4rem;
        border-radius: var(--radius-sm);
        font-family: monospace;
    }

    .client-name {
        font-weight: 600;
        color: #ffffff;
    }

    .share-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .mini-progress {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .mini-bar {
        height: 100%;
        background: var(--color-brand);
        border-radius: var(--radius-full);
    }

    .share-label {
        font-size: 0.78rem;
        font-family: monospace;
        color: var(--text-secondary);
        min-width: 42px;
        text-align: right;
    }

    .text-right { text-align: right !important; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-sm { font-size: 0.8rem; }
    .text-muted { color: var(--text-muted) !important; }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted);
        font-size: 0.95rem;
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

    /* Print Optimizations */
    @media print {
        .no-print {
            display: none !important;
        }

        .sales-report-page {
            max-width: 100% !important;
            padding: 0 !important;
            color: #000000 !important;
        }

        .report-header-banner, .kpi-card, .collection-meter-section, .podium-card, .table-section {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            break-inside: avoid;
        }

        .header-content h1, .section-title h2, .table-section-header h2, .kpi-value, .prod-name, .client-name {
            color: #000000 !important;
        }

        .kpi-label, .podium-m-item .label, .report-table th, .text-muted {
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

    @media (max-width: 768px) {
        .sales-report-page {
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

        .kpi-grid {
            grid-template-columns: 1fr;
        }

        .podium-grid {
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
