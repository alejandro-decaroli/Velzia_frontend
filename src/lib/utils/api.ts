
export async function deleteEntity(route: string, id: string, token: string, name_entity: string, showForm: boolean, entity: any, data: any, loading: boolean, error: string) {
    try {
        const response = await fetch(`http://localhost:3000/${route}/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
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

export async function loadEntity(route: string, id: string, token: string, name_entity: string, showForm: boolean, entity: any, data: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/${route}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            data = await response.json();
            if (data.errors && Array.isArray(data.errors)) {
                error = data.errors.map((e: any) => e.msg).join(', ');
            } else {
                error = data.message || `Error al cargar el ${name_entity}`;
            }
            throw new Error(error);
        }
        
        if (response.ok) {
            data = await response.json();
            entity = data[name_entity];
            showForm = true;
            return { loading: false, error, entity, showForm };
        }
    } catch (err) {
        error = `${err}`;
        return { loading: false, error };
    }
}

export async function updateEntity(route: string, id: string, token: string, name_entity: string, showForm: boolean, entity: any, data: any, loading: boolean, error: string) {
    try {
        loading = true;
        error = "";
        
        const response = await fetch(`http://localhost:3000/${route}/update/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entity)
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
    token: string, 
    data: any, 
    loading: boolean, 
    error: string | null
): Promise<{ loading: boolean; error: string | null; entities: any[] }> {
    try {
        loading = true;
        error = null;
        
        const response = await fetch(`http://localhost:3000/${entity}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
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
