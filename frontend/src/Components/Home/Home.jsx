import { useEffect, useState } from "react";
import { CiShoppingBasket, CiReceipt, CiCircleInfo } from "react-icons/ci";

import ShopsClient from "../ShopsClient/ShopsClient";
import Facturas from "../Facturas/Facturas";

import "./Home.css"


export default function Home({ user })
{

    const [currentPage, setCurrentPage] = useState("home");
    const [tiendas, setTiendas] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {

        async function retrieveStores()
        {
            try
            {
                const res = await fetch("http://localhost:8081/cliente", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (!res.ok) return setError(data.error);
                setTiendas(data);
            }
            catch (err)
            {
                console.error("Fallo en dashboard:", err);
                setError("No se pudo conectar con el servidor.");
            }
        }

        retrieveStores();

    }, [])

    function actualizarTienda(nueva)
    {
        setTiendas(prev => prev.map(t => t.id === nueva.id ? nueva : t));
    }

    return(

        <div className="homeMain">

            <div className="homeNavBar">
                <div className={currentPage === "home" ? "homeSelected" : "homeUnselected" } onClick={() =>setCurrentPage("home")}>
                    <CiShoppingBasket className="homeIcon"/>
                    <p>Comprar</p>
                </div>
                <div className={currentPage === "facturas" ? "homeSelected" : "homeUnselected"} onClick={() =>setCurrentPage("facturas")}>
                    <CiReceipt className="homeIcon"/>
                    <p>Facturas</p>
                </div>
            </div>
            <div className="homeSeparator" />
            {currentPage === "home" && (
                !tiendas
                    ? <p>Cargando...</p>
                    : <ShopsClient
                        tiendas={tiendas}
                        setTiendas={setTiendas}
                        onTiendaActualizada={actualizarTienda}
                        nombreCliente={user.nombre}
                        idCliente={user.id}
                    />
            )}
            {currentPage === "facturas" && <Facturas userId={user.id} />}

        </div>


    );

}