package main

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
)

type Usuario struct {
	ID       int    `json:"id"`
	Nombre   string `json:"nombre"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
	Rol      string `json:"rol"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type signUpRequest struct {
	Nombre   string `json:"nombre"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Rol      string `json:"rol"`
}

var usuariosMu sync.Mutex

func guardarUsuarios(usuarios []Usuario) error {
	data, err := json.MarshalIndent(usuarios, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("usuarios.json", data, 0644)
}

func cargarUsuarios() ([]Usuario, error) {
	data, err := os.ReadFile("usuarios.json")
	if err != nil {
		return nil, err
	}
	var usuarios []Usuario
	err = json.Unmarshal(data, &usuarios)
	return usuarios, err
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

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	usuarios, err := cargarUsuarios()
	if err != nil {
		http.Error(w, "error leyendo usuarios", http.StatusInternalServerError)
		return
	}
	for _, u := range usuarios {
		if u.Email == req.Email && u.Password == req.Password {
			u.Password = "" // con omitempty, no se envía
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(u)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write([]byte(`{"error":"Credenciales inválidas"}`))
}

func signUpHandler(w http.ResponseWriter, r *http.Request){
	if r.Method != http.MethodPost {
		http.Error(w, "método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req signUpRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		responderError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	req.Nombre = strings.TrimSpace(req.Nombre)
	req.Email = strings.TrimSpace(req.Email)

	usuariosMu.Lock()
	defer usuariosMu.Unlock()

	usuarios, err := cargarUsuarios()
	if err != nil {
		responderError(w, http.StatusInternalServerError, "error leyendo usuarios")
		return
	}

	maxID := 0
	for _, u := range usuarios {
		if strings.EqualFold(u.Email, req.Email) {
			responderError(w, http.StatusConflict, "Ese correo ya está registrado")
			return
		}
		if u.ID > maxID {
			maxID = u.ID
		}
	}

	nuevo := Usuario{
		ID:       maxID + 1,
		Nombre:   req.Nombre,
		Email:    req.Email,
		Password: req.Password,
		Rol:      req.Rol,
	}
	usuarios = append(usuarios, nuevo)

	if err := guardarUsuarios(usuarios); err != nil {
		responderError(w, http.StatusInternalServerError, "Error guardando usuario")
		return
	}

	nuevo.Password = "" // CONTRASEÑA SE MANTIENE EN SECRETO
	responderJSON(w, http.StatusCreated, nuevo)

}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/login", loginHandler)
	mux.HandleFunc("/signup", signUpHandler)
	http.ListenAndServe(":8080", corsMiddleware(mux))
}