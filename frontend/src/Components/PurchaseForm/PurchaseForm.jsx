import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { CiShop } from "react-icons/ci";

import SingleProductPurchase from "../SingleProductPurchase/SingleProductPurchase";

import './PurchaseForm.css'

function cantidadValida(valor, stock)
{

    const n = Number(valor);
    return Number.isInteger(n) && n >= 0 && n <= stock;

}

export default function PurchaseForm({ tienda, setFormActive, onTiendaActualizada, nombreCliente, idCliente })
{

    const [cantidades, setCantidades] = useState(() => tienda.productos.map(() => "0"));
    const [error, setError] = useState("");
    const [comprando, setComprando] = useState(false);

    const hayInvalidas = tienda.productos.some((p, i) => !cantidadValida(cantidades[i], p.stock));

    function closeForm()
    {

        setFormActive(false);

    }

    function cambiarCantidad(index, valor)
    {

        setError("");
        setCantidades(prev => prev.map((c, i) => i === index ? valor : c));

    }

    async function processPurchase()
    {

        setError("");

        if (hayInvalidas) return;

        const items = tienda.productos
            .map((p, i) => ({ nombre: p.nombre, cantidad: Number(cantidades[i]) }))
            .filter(item => item.cantidad > 0);

        if (items.length === 0)
            return setError("No has seleccionado ningún producto");

        setComprando(true);
        try
        {
            const res = await fetch("http://localhost:8081/compra", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tiendaId: tienda.id, idCliente, nombreCliente, items })
            });
            const data = await res.json();

            if (res.status === 409)
            {
                onTiendaActualizada(data.tienda);
                setCantidades(data.tienda.productos.map(() => "0"));
                return setError(data.error);
            }
            if (!res.ok) return setError(data.error);

            onTiendaActualizada(data);
            setFormActive(false);
        }
        catch (err)
        {
            console.error("Fallo en la compra:", err);
            setError("No se pudo conectar con el servidor");
        }
        finally
        {
            setComprando(false);
        }

    }

    return(

        <div className='purchaseFormBG'>
            <div className='purchaseFormContainer'>
                <div className="productEditFormCloseDiv">
                    <IoMdClose className="productEditFormCloseIcon" onClick={() => closeForm()}/>
                </div>
                <CiShop className="shopsClientIcon1"/>
                <h3>{("TIENDA DE " + tienda.nombre).toUpperCase()}</h3>
                <p>Selecciona la cantidad de productos que deseas comprar, ¡y listo!</p>
                <div className="purchaseFormItemsContainer">
                    {tienda.productos.map((p, index) =>
                        <SingleProductPurchase
                            key={index}
                            producto={p}
                            cantidad={cantidades[index]}
                            invalida={!cantidadValida(cantidades[index], p.stock)}
                            onCantidadChange={(valor) => cambiarCantidad(index, valor)} />
                    )}
                </div>
                <p className="purchaseFormError">{hayInvalidas ? "Hay compras por cantidades inválidas" : error}</p>
                <button className="purchaseFormButton" disabled={comprando} onClick={() => processPurchase()}>CONFIRMAR COMPRA</button>
            </div>
        </div>

    );

}