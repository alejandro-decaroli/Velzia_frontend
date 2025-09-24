
export async function deleteEntity(route: string, id: string, name_entity: string, loading: boolean, error: string) {
    try {
        const response = await fetch(`http://localhost:3000/${route}/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        
        if (response.ok) {
            // Recargar la página después de eliminar
            window.location.reload();
            return { loading, error };
        } 
        if (!response.ok) {
            const data = await response.json();
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al eliminar el ${name_entity}`;
            }
            throw new Error(error);

        }
    } catch (error) {
        error = `${error}`;
        return { loading, error };
    }
    
}

export async function loadEntity(route: string, id: string, name_entity: string, showForm: boolean, entity: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/${route}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al cargar el ${name_entity}`;
            }
            throw new Error(error);
        }
        
        if (response.ok) {
            entity = data[name_entity];
            showForm = true;
            return { loading: false, error, entity, showForm };
        }
    } catch (err) {
        error = `${err}`;
        return { loading: false, error };
    }
}

export async function updateEntity(route: string, id: string, name_entity: string, showForm: boolean, entity: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/${route}/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entity),
            credentials: "include"
        });
        
        if (!response.ok) {
            const data = await response.json();
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al crear el ${name_entity}`;
            }
            throw new Error(error);
        }
        
        // Cerrar el formulario después de actualizar
        showForm = false;
        window.location.reload();
        return { loading: false, error, showForm };
    } catch (err) {
        error = `${err}`;
        return { loading: false, error, showForm };
    }
}


export async function fetchEntity(
    entity: string, 
    entities: any[], 
    loading: boolean, 
    error: string | null
): Promise<{ loading: boolean; error: string | null; entities: any[] }> {
    try {
        loading = true;
        error = null;
        
        const response = await fetch(`http://localhost:3000/${entity}`, {
            method: "GET",
            credentials: "include"
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al cargar ${entity}`);
        }

        const responseData = await response.json();
        entities = Array.isArray(responseData) ? responseData : (responseData[entity] || []);
        
        return { loading: false, error: null, entities };
    } catch (err) {
        return { 
            loading: false, 
            error: err instanceof Error ? err.message : 'Error desconocido', 
            entities: [] 
        };
    }
}

export async function pagarEntity(route: string, id: string, name_entity: string, showForm: boolean, entity: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/${route}/pagar/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entity),
            credentials: "include"
        });
        
        if (!response.ok) {
            const data = await response.json();
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al pagar el ${name_entity}`;
            }
            throw new Error(error);
        }
        
        // Cerrar el formulario después de pagar
        showForm = false;
        window.location.reload();
        return { loading: false, error, showForm };
    } catch (err) {
        error = `${err}`;
        return { loading: false, error, showForm };
    }
}

export async function registrarDetalle(id_venta: string, showForm: boolean, entity: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/ventas/registrar_detalle/${id_venta}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entity),
            credentials: "include"
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al registrar el detalle de la venta`;
            }
            throw new Error(error);
        }
        
        // Cerrar el formulario después de pagar
        showForm = false;
        window.location.reload();
        return { loading: false, error, showForm, data };
    } catch (err) {
        error = `${err}`;
        return { loading: false, error, showForm };
    }
}

export async function getDetalles(
    entities: any[], 
    id_venta: any, 
    loading: boolean, 
    error: string | null
): Promise<{ loading: boolean; error: string | null; entities: any[] }> {
    try {
        loading = true;
        error = null;
        
        const response = await fetch(`http://localhost:3000/ventas/detalle_venta/${id_venta}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al cargar detalles`);
        }

        const responseData = await response.json();
        entities = Array.isArray(responseData) ? responseData : (responseData["detalles"] || []);
        
        return { loading: false, error: null, entities };
    } catch (err) {
        return { 
            loading: false, 
            error: err instanceof Error ? err.message : 'Error desconocido', 
            entities: [] 
        };
    }
}

export async function getDetallesByUser(
    entities: any[], 
    loading: boolean, 
    error: string | null
): Promise<{ loading: boolean; error: string | null; entities: any[] }> {
    try {
        loading = true;
        error = null;
        
        const response = await fetch(`http://localhost:3000/ventas/detalles`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al cargar detalles`);
        }

        const responseData = await response.json();
        entities = Array.isArray(responseData) ? responseData : (responseData["detalles"] || []);
        
        return { loading: false, error: null, entities };
    } catch (err) {
        return { 
            loading: false, 
            error: err instanceof Error ? err.message : 'Error desconocido', 
            entities: [] 
        };
    }
}

export async function cargarDetalle(id: string, showForm: boolean, entity: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/ventas/detalle/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        
        const data = await response.json();
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al cargar el detalle`;
            }
            throw new Error(error);
        }
        
        if (response.ok) {
            entity = data["detalles"];
            showForm = true;
            return { loading: false, error, entity, showForm };
        }
    } catch (err) {
        error = `${err}`;
        return { loading: false, error };
    }
}

export async function createEntity(route: string, formData: any, closeModal: () => void, error: string, loading: boolean, name_entity: string) {
    try {
        const response = await fetch(`http://localhost:3000/${route}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            closeModal();
            // Recargar la página después de crear para ver los cambios
            window.location.reload();
        } 
        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al crear el ${name_entity}`;
            }
            throw new Error(error);
        }
        return data;
    } catch (err) {
        error = `${err}`;
        return {error};
    }
}