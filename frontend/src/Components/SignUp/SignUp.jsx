import { useState } from 'react';

import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { MdCheckBox } from "react-icons/md";
import './SignUp.css'

export default function SignUp({ setCurrentPage })
{

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [rol, setRol] = useState("cliente")

    function handleSignUpSwitch()
    {

        setCurrentPage("LOGIN");

    }
    function handleRolSwitch(newRol)
    {

        setRol(newRol);

    }

    async function handleSubmit(e)
    {

        e.preventDefault();
        setError("");

        if (name == "" || email == "" || password == "" || confirmPassword == "")
            return setError("No se han llenado todos los campos.");

        if (password != confirmPassword)
            return setError("Las contraseñas no coinciden.");

        try
        {

            const res = await fetch("http://localhost:8080/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: name, email, password, rol })
            });

            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setCurrentPage("LOGIN");

        }
        catch
        {

            setError("No se pudo conectar con el servidor");

        }

        

    }

    return(

        <div className='signupMain'>
            <div className='signupContainer'>

                <h1>REGISTRARSE</h1>
                <p>Por favor introduzca los datos requeridos a continuación para crear su cuenta.</p>
                <div className='signupFormContainer'>
                    <form className='signupForm' onSubmit={handleSubmit}>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nombre Completo" 
                            className='signupFormInputField'/>
                        <input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            className='signupFormInputField'/>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Contraseña" 
                            className='signupFormInputField'/>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="Confirmar Contraseña" 
                            className='signupFormInputField'/>
                        <div className='signupRolContainer'>

                            {rol === "cliente" ? <MdCheckBox    className='signupCheckbox' 
                                                                onClick={() => handleRolSwitch("cliente")}/> : 
                            <MdCheckBoxOutlineBlank className='signupCheckbox'
                                                    onClick={() => handleRolSwitch("cliente")}/>}  
                            <p style={{ cursor: "pointer" }} onClick={() => handleRolSwitch("cliente")} >CLIENTE</p>
                            {rol === "vendedor" ? <MdCheckBox   className='signupCheckbox' 
                                                                onClick={() => handleRolSwitch("vendedor")}/> : 
                            <MdCheckBoxOutlineBlank className='signupCheckbox' 
                                                    onClick={() => handleRolSwitch("vendedor")}/>}  
                            <p style={{ cursor: "pointer" }} onClick={() => handleRolSwitch("vendedor")}>VENDEDOR</p>

                        </div>
                        {error && <p className='signupError'>{error}</p>}
                        <button type="submit" className='signupFormButton'>REGISTRARSE</button>
                    </form>
                </div>
                <a onClick={handleSignUpSwitch} className='signupA'>Ya tengo una cuenta</a>
            </div>
        </div>

    );
    
}