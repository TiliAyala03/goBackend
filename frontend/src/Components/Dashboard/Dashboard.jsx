import { useEffect, useState } from "react";

import { CiShop, CiReceipt, CiCircleInfo } from "react-icons/ci";

import ShopContainer from "../ShopContainer/ShopContainer";
import Facturas from "../Facturas/Facturas";
import "./Dashboard.css"

export default function Dashboard({ user })
{

    const [error, setError] = useState("")
    const [tienda, setTienda] = useState(null);
    const [currentPage, setCurrentPage] = useState("dashboard");

    useEffect(() => {

        async function retrieveStore()
        {
            try
            {
                const res = await fetch("http://localhost:8081/dashboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id, nombre: user.nombre })
                });
                const data = await res.json();
                if (!res.ok) return setError(data.error);
                setTienda(data);
            }
            catch (err)
            {
                console.error("Fallo en dashboard:", err);
                setError("No se pudo conectar con el servidor.");
            }
        }

        retrieveStore();

    }, []);

    if (error) return <p>{error}</p>;
    if (!tienda) return <p>Cargando tu tienda...</p>;

    return(

        <div className="dashboardMain">

            <div className="dashboardNavBar">
                <div className={currentPage === "dashboard" ? "dashboardSelected" : "dashboardUnselected"} onClick={() =>setCurrentPage("dashboard")}>
                    <CiShop className="dashboardIcon"/>
                    <p>Mi Tienda</p>
                </div>
                <div className={currentPage === "facturas" ? "dashboardSelected" : "dashboardUnselected"}onClick={() =>setCurrentPage("facturas")}>
                    <CiReceipt className="dashboardIcon"/>
                    <p>Facturas</p>
                </div>
            </div>
            <div className="dashboardSeparator" />
            {currentPage === "dashboard" && <ShopContainer tienda={tienda} setTienda={setTienda} user={user}/>}
            {currentPage === "facturas" && <Facturas userId={user.id} />}
            

        </div>

    );

}