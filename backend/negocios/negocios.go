package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"sync"
)

type Producto struct {
	Nombre string `json:"nombre"`
	Stock  int    `json:"stock"`
	Precio int    `json:"precio"`
}

type Tienda struct {
	ID        int        `json:"id"`
	Productos []Producto `json:"productos"`
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

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ID int `json:"id"`
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

	nueva := Tienda{ID: req.ID, Productos: []Producto{}}
	tiendas = append(tiendas, nueva)
	if err := guardarTiendas(tiendas); err != nil {
		responderError(w, http.StatusInternalServerError, "Error guardando tienda")
		return
	}
	responderJSON(w, http.StatusCreated, nueva)

}

func main() {

	mux := http.NewServeMux()
	mux.HandleFunc("/dashboard", dashboardHandler)
	http.ListenAndServe(":8081", corsMiddleware(mux))

}
