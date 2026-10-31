package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

type ProductoFactura struct {
	Nombre       string `json:"nombre"`
	Cantidad     int    `json:"cantidad"`
	PrecioUnidad int    `json:"precioUnidad"`
}

type Factura struct {
	ID             int               `json:"id"`
	IDVendedor     int               `json:"idVendedor"`
	NombreVendedor string            `json:"nombreVendedor"`
	IDCliente      int               `json:"idCliente"`
	NombreCliente  string            `json:"nombreCliente"`
	Fecha          string            `json:"fecha"`
	Productos      []ProductoFactura `json:"productos"`
}

type facturarRequest struct {
	IDVendedor     int               `json:"idVendedor"`
	NombreVendedor string            `json:"nombreVendedor"`
	IDCliente      int               `json:"idCliente"`
	NombreCliente  string            `json:"nombreCliente"`
	Productos      []ProductoFactura `json:"productos"`
}

var facturasMu sync.Mutex

func cargarFacturas() ([]Factura, error) {
	data, err := os.ReadFile("facturas.json")
	if errors.Is(err, os.ErrNotExist) {
		return []Factura{}, nil
	}
	if err != nil {
		return nil, err
	}
	var facturas []Factura
	err = json.Unmarshal(data, &facturas)
	return facturas, err
}

func guardarFacturas(facturas []Factura) error {
	data, err := json.MarshalIndent(facturas, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("facturas.json", data, 0644)
}

func facturar(datos facturarRequest) (Factura, error) {
	facturasMu.Lock()
	defer facturasMu.Unlock()

	facturas, err := cargarFacturas()
	if err != nil {
		return Factura{}, err
	}

	maxID := 0
	for _, f := range facturas {
		if f.ID > maxID {
			maxID = f.ID
		}
	}

	nueva := Factura{
		ID:             maxID + 1,
		IDVendedor:     datos.IDVendedor,
		NombreVendedor: datos.NombreVendedor,
		IDCliente:      datos.IDCliente,
		NombreCliente:  datos.NombreCliente,
		Fecha:          time.Now().Format("02/01/2006"),
		Productos:      datos.Productos,
	}

	facturas = append(facturas, nueva)
	if err := guardarFacturas(facturas); err != nil {
		return Factura{}, err
	}
	return nueva, nil
}

func misFacturasHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		responderError(w, http.StatusMethodNotAllowed, "método no permitido")
		return
	}

	id, err := strconv.Atoi(r.URL.Query().Get("id"))
	if err != nil || id <= 0 {
		responderError(w, http.StatusBadRequest, "id inválido")
		return
	}

	facturasMu.Lock()
	defer facturasMu.Unlock()

	facturas, err := cargarFacturas()
	if err != nil {
		log.Println("error leyendo facturas:", err)
		responderError(w, http.StatusInternalServerError, "error leyendo facturas")
		return
	}

	resultado := []Factura{}
	for _, f := range facturas {
		if f.IDVendedor == id || f.IDCliente == id {
			resultado = append(resultado, f)
		}
	}
	responderJSON(w, http.StatusOK, resultado)
}

func responderJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func responderError(w http.ResponseWriter, status int, msg string) {
	responderJSON(w, status, map[string]string{"error": msg})
}

func facturarHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		responderError(w, http.StatusMethodNotAllowed, "método no permitido")
		return
	}

	var req facturarRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responderError(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if req.IDVendedor <= 0 || req.IDCliente <= 0 ||
		req.NombreVendedor == "" || req.NombreCliente == "" || len(req.Productos) == 0 {
		responderError(w, http.StatusBadRequest, "factura inválida")
		return
	}
	for _, p := range req.Productos {
		if p.Nombre == "" || p.Cantidad <= 0 || p.PrecioUnidad < 0 {
			responderError(w, http.StatusBadRequest, "factura inválida")
			return
		}
	}

	factura, err := facturar(req)
	if err != nil {
		log.Println("error facturando:", err)
		responderError(w, http.StatusInternalServerError, "error guardando factura")
		return
	}
	responderJSON(w, http.StatusCreated, factura)
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

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/factura", facturarHandler)
	mux.HandleFunc("/facturas", misFacturasHandler)
	log.Fatal(http.ListenAndServe(":8082", corsMiddleware(mux)))
}