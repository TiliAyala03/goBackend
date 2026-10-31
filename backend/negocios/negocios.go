package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type Producto struct {
	Nombre string `json:"nombre"`
	Stock  int    `json:"stock"`
	Precio int    `json:"precio"`
}

type Tienda struct {
	ID        int        `json:"id"`
	Nombre    string     `json:"nombre"` // NUEVO: nombre del vendedor
	Productos []Producto `json:"productos"`
}

// NUEVO: tipos de la compra
type itemCompra struct {
	Nombre   string `json:"nombre"`
	Cantidad int    `json:"cantidad"`
}

type compraRequest struct {
	TiendaID      int          `json:"tiendaId"`
	IDCliente     int          `json:"idCliente"`
	NombreCliente string       `json:"nombreCliente"`
	Items         []itemCompra `json:"items"`
}


type productoFactura struct {
	Nombre       string `json:"nombre"`
	Cantidad     int    `json:"cantidad"`
	PrecioUnidad int    `json:"precioUnidad"`
}

func responderJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func responderError(w http.ResponseWriter, status int, msg string) {
	responderJSON(w, status, map[string]string{"error": msg})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions { // el preflight
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

var tiendasMu sync.Mutex


var clienteHTTP = &http.Client{Timeout: 3 * time.Second}

func cargarTiendas() ([]Tienda, error) {
	data, err := os.ReadFile("tiendas.json")
	if errors.Is(err, os.ErrNotExist) {
		return []Tienda{}, nil
	}
	if err != nil {
		return nil, err
	}
	var tiendas []Tienda
	err = json.Unmarshal(data, &tiendas)
	return tiendas, err
}

func guardarTiendas(tiendas []Tienda) error {
	data, err := json.MarshalIndent(tiendas, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("tiendas.json", data, 0644)
}

func buscarProducto(productos []Producto, nombre string) int {
	for i := range productos {
		if productos[i].Nombre == nombre {
			return i
		}
	}
	return -1
}

func solicitarFactura(t Tienda, req compraRequest, productos []productoFactura) error {
	body, err := json.Marshal(map[string]any{
		"idVendedor":     t.ID, // el id de la tienda coincide con el del vendedor
		"nombreVendedor": t.Nombre,
		"idCliente":      req.IDCliente,
		"nombreCliente":  strings.TrimSpace(req.NombreCliente),
		"productos":      productos,
	})
	if err != nil {
		return err
	}

	resp, err := clienteHTTP.Post("http://localhost:8082/factura", "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("el servicio de facturas respondió %d", resp.StatusCode)
	}
	return nil
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ID     int    `json:"id"`
		Nombre string `json:"nombre"` // NUEVO
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if req.ID <= 0 {
		responderError(w, http.StatusBadRequest, "id inválido")
		return
	}

	tiendasMu.Lock()
	defer tiendasMu.Unlock()

	tiendas, err := cargarTiendas()
	if err != nil {
		responderError(w, http.StatusInternalServerError, "error leyendo tiendas")
		return
	}

	for _, t := range tiendas {
		if t.ID == req.ID {
			responderJSON(w, http.StatusOK, t)
			return
		}
	}

	nombre := strings.TrimSpace(req.Nombre)
	if nombre == "" {
		responderError(w, http.StatusBadRequest, "nombre inválido")
		return
	}

	nueva := Tienda{ID: req.ID, Nombre: nombre, Productos: []Producto{}}
	tiendas = append(tiendas, nueva)
	if err := guardarTiendas(tiendas); err != nil {
		responderError(w, http.StatusInternalServerError, "Error guardando tienda")
		return
	}
	responderJSON(w, http.StatusCreated, nueva)

}

func homeHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodGet {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}

	tiendasMu.Lock()
	defer tiendasMu.Unlock()

	tiendas, err := cargarTiendas()
	if err != nil {
		responderError(w, http.StatusInternalServerError, "error leyendo tiendas")
		return
	}

	responderJSON(w, http.StatusOK, tiendas)

}

func guardarTiendaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		responderError(w, http.StatusMethodNotAllowed, "método no permitido")
		return
	}

	var nueva Tienda
	if err := json.NewDecoder(r.Body).Decode(&nueva); err != nil {
		responderError(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if nueva.ID <= 0 {
		responderError(w, http.StatusBadRequest, "id inválido")
		return
	}
	if nueva.Productos == nil {
		nueva.Productos = []Producto{}
	}

	tiendasMu.Lock()
	defer tiendasMu.Unlock()

	tiendas, err := cargarTiendas()
	if err != nil {
		responderError(w, http.StatusInternalServerError, "error leyendo tiendas")
		return
	}

	for i := range tiendas {
		if tiendas[i].ID == nueva.ID {
			tiendas[i] = nueva
			if err := guardarTiendas(tiendas); err != nil {
				responderError(w, http.StatusInternalServerError, "error guardando tienda")
				return
			}
			responderJSON(w, http.StatusOK, nueva)
			return
		}
	}

	responderError(w, http.StatusNotFound, "tienda no encontrada")
}

// NUEVO
func compraHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		responderError(w, http.StatusMethodNotAllowed, "método no permitido")
		return
	}

	var req compraRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responderError(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if req.TiendaID <= 0 || len(req.Items) == 0 || strings.TrimSpace(req.NombreCliente) == "" {
		responderError(w, http.StatusBadRequest, "compra inválida")
		return
	}
	for _, it := range req.Items {
		if it.Nombre == "" || it.Cantidad <= 0 {
			responderError(w, http.StatusBadRequest, "compra inválida")
			return
		}
	}

	tiendasMu.Lock()
	defer tiendasMu.Unlock()

	tiendas, err := cargarTiendas()
	if err != nil {
		responderError(w, http.StatusInternalServerError, "error leyendo tiendas")
		return
	}

	idx := -1
	for i := range tiendas {
		if tiendas[i].ID == req.TiendaID {
			idx = i
			break
		}
	}
	if idx == -1 {
		responderError(w, http.StatusNotFound, "tienda no encontrada")
		return
	}

	t := &tiendas[idx]

	copia := make([]Producto, len(t.Productos))
	copy(copia, t.Productos)

	agotado := false
	var productosFactura []productoFactura
	for _, it := range req.Items {
		j := buscarProducto(copia, it.Nombre)
		if j == -1 || copia[j].Stock < it.Cantidad {
			agotado = true
			break
		}
		copia[j].Stock -= it.Cantidad
		productosFactura = append(productosFactura, productoFactura{
			Nombre:       it.Nombre,
			Cantidad:     it.Cantidad,
			PrecioUnidad: copia[j].Precio,
		})
	}

	if agotado {
		responderJSON(w, http.StatusConflict, map[string]any{
			"error":  "Disculpa, se agotaron uno o más productos de los que tenías seleccionados. Se ha actualizado la lista de productos disponibles.",
			"tienda": *t, 
		})
		return
	}


	if err := solicitarFactura(*t, req, productosFactura); err != nil {
		log.Println("no se pudo facturar:", err)
		responderError(w, http.StatusBadGateway, "No se pudo generar la factura, así que la compra no se realizó. Intenta de nuevo.")
		return
	}

	t.Productos = copia
	if err := guardarTiendas(tiendas); err != nil {
		responderError(w, http.StatusInternalServerError, "error guardando tienda")
		return
	}
	responderJSON(w, http.StatusOK, *t)
}

func main() {

	mux := http.NewServeMux()
	mux.HandleFunc("/dashboard", dashboardHandler)
	mux.HandleFunc("/tienda", guardarTiendaHandler)
	mux.HandleFunc("/cliente", homeHandler)
	mux.HandleFunc("/compra", compraHandler) // NUEVO
	http.ListenAndServe(":8081", corsMiddleware(mux))

}