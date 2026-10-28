import { useEffect, useState } from "react";

import "./Dashboard.css"

export default function Dashboard({ user })
{

    const [error, setError] = useState("Hola!")

    useEffect(() => {

        async function retrieveStore()
        {
            try
            {
                const res = await fetch("http://localhost:8081/dashboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id })
                });
                const data = await res.json();
                if (!res.ok) return setError(data.error);
                setError("El servidor respondió, id: " + data.id);
            }
            catch (err)
            {
                console.error("Fallo en dashboard:", err);
                setError("No se pudo conectar con el servidor.");
            }
        }

        retrieveStore();

    }, []);

    return(

        <div className="dashboardMain">

            <p>{ error }</p>

        </div>

    );

}