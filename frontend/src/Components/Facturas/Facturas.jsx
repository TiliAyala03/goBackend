import { useEffect, useState } from "react";

import './Facturas.css'

export default function Facturas({ userId })
{

    const [facturas, setFacturas] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {

        async function retrieveFacturas()
        {
            try
            {
                const res = await fetch("http://localhost:8082/facturas?id=" + userId);
                const data = await res.json();
                if (!res.ok) return setError(data.error);
                setFacturas(data);
            }
            catch (err)
            {
                console.error("Fallo cargando facturas:", err);
                setError("No se pudo conectar con el servidor.");
            }
        }

        retrieveFacturas();

    }, [userId]);

    if (error) return <p>{error}</p>;
    if (!facturas) return <p>Cargando facturas...</p>;
    if (facturas.length === 0) return <p>Todavía no tienes facturas.</p>;

    return (
        <div className="facturasMain">
            {facturas.map((f, index) => (

                <div key={index} className="factura">
                    <h3>TU COMPRA EN LA TIENDA DE {" " + f.nombreVendedor.toUpperCase()}</h3>
                    <p>------------------------------------------------</p>
                    <p>{f.fecha}</p>
                    <p>Vendido por: {" " + f.nombreVendedor}</p>
                    <p>Cliente: {" " + f.nombreCliente}</p>
                    <p></p>
                    <p>------------------------------------------------</p>
                    <h4>PRODUCTOS</h4>
                    <p>------------------------------------------------</p>
                    {f.productos.map((p, index) => (

                        <p>{p.nombre + "   x" + p.cantidad + "    a " + p.precioUnidad + " la unidad."}</p>

                    ))}
                </div>

            ))}
        </div>
    );

}