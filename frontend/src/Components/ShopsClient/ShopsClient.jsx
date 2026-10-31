import { useState } from "react";
import { CiShop } from "react-icons/ci";

import SingleProduct from "../SingleProduct/SingleProduct";
import PurchaseForm from "../PurchaseForm/PurchaseForm";

import './ShopsClient.css'

export default function ShopsClient({ tiendas, setTiendas, onTiendaActualizada, nombreCliente, idCliente })
{

    const [formActive, setFormActive] = useState(false)
    const [currentTienda, setCurrentTienda] = useState(null);

    function showPurchaseForm(t)
    {

        setCurrentTienda(t);
        setFormActive(true);

    }

    return(

        <div className="shopsClientMain">

            {tiendas.map((t) => <div className="shopsClientShop" onClick={() => showPurchaseForm(t)}>
                                    <CiShop className="shopsClientIcon1"/>
                                    <h3>{("Tienda de " + t.nombre).toUpperCase()}</h3>
                                    <div className="shopsClientShopInner">
                                        {t.productos.slice(0, 2).map((p, index) => (<SingleProduct  key={index} 
                                                                                                    product={p.nombre} 
                                                                                                    price={p.precio} 
                                                                                                    stock={p.stock} 
                                                                                                    canBeEdited={false}/>))}
                                        {t.productos.length > 2 && <p className="shopsClientP">ver más. . .</p>}
                                    </div>
                                </div>)}
            
            {formActive && <PurchaseForm tienda={currentTienda} setFormActive={setFormActive} onTiendaActualizada={onTiendaActualizada} nombreCliente={nombreCliente} idCliente={idCliente}/>}
        </div>

    );

}