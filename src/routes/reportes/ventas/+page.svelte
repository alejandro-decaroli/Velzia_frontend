<script>
    import { onMount } from 'svelte';
    import { fetchEntity } from '$lib/utils/api.js';
    import GoBack from "$lib/components/goback.svelte"
    import { checkUser, user } from "$lib/stores/auth.js";

    let error = null;
    let ventas = [];
    let tasas = [];
    let monedas = [];
    let moneda_principal = "";
    let ventasPagadas = [];
    let ventasPendientes = [];
    let ingreso_ventas = 0;
    let ingreso_ventas_pagas = 0;
    let ingreso_ventas_pendientes = 0;
    let ingreso_ventas_por_cobrar = 0;
    let productos = [];
    let producto_mas_vendido = {nombre: "", cantidad: 0, subtotal: 0};
    let producto_mas_rentable = {nombre: "", cantidad: 0, subtotal: 0};
    let producto_menos_vendido = {nombre: "", cantidad: 0, subtotal: 0};
    let producto_menos_rentable = {nombre: "", cantidad: 0, subtotal: 0};

    onMount(async () => {
        const userData = await checkUser(error);
        if (userData) {
            user.set(userData);
        }
        tasas = await fetchEntity("tasas", error);
        tasas = tasas.entities;
        monedas = await fetchEntity("monedas", error);
        monedas = monedas.entities;
        ventas = await fetchEntity("ventas", error);
        ventas = ventas.entities;
        if (ventas.length > 0) {
            ventas.forEach(venta => {
                if (venta.moneda.id === 1) {
                    ingreso_ventas += venta.total;
                } else {
                    tasas.forEach(tasa => {
                        if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === 1) {
                            ingreso_ventas += venta.total / tasa.tasa;
                        }
                    })
                }
                if (venta.detalles.length > 0) {
                    venta.detalles.forEach(detalle => {
                        if (venta.moneda.id === 1) {
                            productos.push({
                                nombre: detalle.producto.nombre,
                                cantidad: detalle.cantidad,
                                subtotal: detalle.subtotal
                            });
                        } else {
                            tasas.forEach(tasa => {
                                if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === 1) {
                                    productos.push({
                                        nombre: detalle.producto.nombre,
                                        cantidad: detalle.cantidad,
                                        subtotal: detalle.subtotal / tasa.tasa
                                    });
                                }
                            })
                        }
                    })
                }
                if (venta.estado === "Paga") {
                    ventasPagadas.push(venta);
                    if (venta.moneda.id === 1) {
                        ingreso_ventas_pagas += venta.total_pagado;
                    } else {
                        tasas.forEach(tasa => {
                            if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === 1) {
                                ingreso_ventas_pagas += venta.total_pagado / tasa.tasa;
                            }
                        })
                    }
                } else {
                    ventasPendientes.push(venta);
                    if (venta.moneda.id === 1) {
                        ingreso_ventas_pendientes += venta.total_pagado;
                        ingreso_ventas_por_cobrar += venta.total - venta.total_pagado;
                    } else {
                        tasas.forEach(tasa => {
                            if (tasa.moneda_destino === venta.moneda.id && tasa.moneda_origen === 1) {
                                ingreso_ventas_pendientes += venta.total_pagado / tasa.tasa;
                                ingreso_ventas_por_cobrar += (venta.total - venta.total_pagado) / tasa.tasa;
                            }
                        })
                    }
                }
            })
        }

        const productosAgrupados = productos.reduce((acumulador, producto) => {
            if (!acumulador[producto.nombre]) {
                acumulador[producto.nombre] = {
                    nombre: producto.nombre,
                    cantidad: 0,
                    subtotal: 0
                };
            }
            acumulador[producto.nombre].cantidad += producto.cantidad;
            acumulador[producto.nombre].subtotal += producto.subtotal;
            return acumulador;
        }, {});

        productos = Object.values(productosAgrupados);
        productos.forEach(producto => {
            if (producto.cantidad > producto_mas_vendido.cantidad) {
                producto_mas_vendido = producto;
                producto_menos_vendido = producto;
            }
            if (producto.subtotal > producto_mas_rentable.subtotal) {
                producto_mas_rentable = producto;
                producto_menos_rentable = producto;
            }
        })
        productos.forEach(producto => {
            if (producto.cantidad < producto_menos_vendido.cantidad) {
                producto_menos_vendido = producto;
            }
            if (producto.subtotal < producto_menos_rentable.subtotal) {
                producto_menos_rentable = producto;
            }
        })
        moneda_principal = monedas.find(monedas => monedas.id === 1).codigo_iso;
    });

</script>
<GoBack route={"/reportes"}/>
<div class="reportes_container">
    <h2>Reporte de ventas</h2>
    <div class="reporte">
        <h3>Ventas</h3>
        <div class="reporte_ventas">
            <p>Total de ventas: {ventas.length}</p>
            <p>Total de ventas pagas: {ventasPagadas.length}</p>
            <p>Total de ventas pendientes: {ventasPendientes.length}</p>
            <p>Porcentaje de ventas pagas: {ventasPagadas.length / ventas.length * 100}%</p>
            <p>Porcentaje de ventas pendientes: {ventasPendientes.length / ventas.length * 100}%</p>
            <p>Ingreso total: ${ingreso_ventas} {moneda_principal}</p>    
            <p>Ingreso de ventas pagas: ${ingreso_ventas_pagas} {moneda_principal}</p>
            <p>Ingreso de ventas pendientes: ${ingreso_ventas_pendientes} {moneda_principal}</p>
            <p>Ingreso por cobrar: ${ingreso_ventas_por_cobrar} {moneda_principal}</p>
            <p>Porcentaje de ingreso de ventas pagas: {ingreso_ventas_pagas / ingreso_ventas * 100}%</p>
            <p>Porcentaje de ingreso de ventas pendientes: {ingreso_ventas_pendientes / ingreso_ventas * 100}%</p>
            <p>Porcentaje de ingreso por cobrar: {ingreso_ventas_por_cobrar / ingreso_ventas * 100}%</p>
        </div>
    </div>
    <div class="reporte">
        <h3>Ventas por producto</h3>
        <div class="reporte_ventas_por_producto">
            <p>Producto más vendido: {producto_mas_vendido.nombre}</p>
            <p>Cantidad vendida: {producto_mas_vendido.cantidad}</p>
            <p>Producto menos vendido: {producto_menos_vendido.nombre}</p>
            <p>Cantidad vendida: {producto_menos_vendido.cantidad}</p>
            <p>Producto más rentable: {producto_mas_rentable.nombre}</p>
            <p>Ingreso: ${producto_mas_rentable.subtotal} {moneda_principal}</p>
            <p>Producto menos rentable: {producto_menos_rentable.nombre}</p>
            <p>Ingreso: ${producto_menos_rentable.subtotal} {moneda_principal}</p>
        </div>
    </div>
</div>

<style>

    .reportes_container {
        width: 100%;
        height: 100%;
        padding-top: 5rem;
        padding-bottom: 3rem;
        padding-left: 3rem;
        padding-right: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        gap: 3rem;
        overflow: scroll;
    }

    .reporte {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background-color: #728AAC;
        padding: 1rem;
        border-radius: 1rem;
        overflow: visible;
    }

    .reporte_ventas {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .reporte_ventas_por_producto {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    @media (max-width: 866px) {
        .reporte_ventas {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
        }

        .reporte_ventas_por_producto {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
        }
    }

</style>