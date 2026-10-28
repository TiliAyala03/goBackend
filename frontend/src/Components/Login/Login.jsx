import { useState } from 'react';
import './Login.css'

export default function Login({ setCurrentPage, onLogin })
{

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) 
    {
        e.preventDefault();
        setError("");
        try 
        {
            const res = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            onLogin(data);
        } 
        catch 
        {
            setError("No se pudo conectar con el servidor");
        }
    }

    function handleSignUpSwitch()
    {

        setCurrentPage("SIGNUP");

    }

    return(

        <div className='loginMain'>
            <div className='loginContainer'>
                <h1 className='loginTitle'>INICIAR SESIÓN</h1>
                <p>Para iniciar sesión, por favor ingresa tu correo y tu contraseña.</p>
                <div className='loginFormContainer'>
                    <form className='loginForm' onSubmit={handleSubmit}>
                        <input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            className='loginFormInputField'/>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Contraseña" 
                            className='loginFormInputField'/>
                        {error && <p className='loginError'>{error}</p>}
                        <button type="submit" className='loginFormButton'>CONTINUAR</button>
                    </form>
                </div>
                <a onClick={handleSignUpSwitch} className='loginA'>Registar una nueva cuenta</a>
            </div>
        </div>

    );
    
}