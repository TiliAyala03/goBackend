import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState } from 'react'

import Login from './Components/Login/Login'
import SignUp from './Components/SignUp/SignUp'
import Dashboard from './Components/Dashboard/Dashboard'

import './index.css'

function App() {

  const [currentPage, setCurrentPage] = useState("LOGIN")
  const [user, setUser] = useState(null);

  function handleLogin(userF)
  {
    setUser(userF);
    setCurrentPage(userF.rol === "vendedor" ? "DASHBOARD" : "HOME");
  }

  function handleLogout()
  {
      setUsuario(null);
      setCurrentPage("LOGIN");
  }

  return (
    <>
      {currentPage === "DASHBOARD" && user?.rol === "vendedor" && <Dashboard user={user}/>}
      {currentPage === "LOGIN" && <Login setCurrentPage={setCurrentPage} onLogin={handleLogin}/>}
      {currentPage === "SIGNUP" && <SignUp setCurrentPage={setCurrentPage}/>}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <App />
  </StrictMode>
)
