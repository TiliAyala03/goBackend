package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Producto struct{
	Nombre 	string	`json:"nombre"`
	Stock 	int		`json:"stock"`
	Precio 	int		`json:"precio"`
}

type Tienda struct{
	ID 			int 		`json:"id"`
	Productos 	[]Producto	`json:"productos"`
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

func dashboardHandler(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodPost {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}
	var req struct{
		ID int `json:"id"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "JSON inválido", http.StatusBadRequest)
        return
    }

	vendorID := req.ID
	fmt.Println(vendorID)
	fmt.Println("Tadaa")

	responderJSON(w, http.StatusOK, map[string]int{"id": vendorID})

}

func main(){

	mux := http.NewServeMux()
	mux.HandleFunc("/dashboard", dashboardHandler)
	http.ListenAndServe(":8081", corsMiddleware(mux))

}