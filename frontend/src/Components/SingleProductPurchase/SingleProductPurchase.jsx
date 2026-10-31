import { AiFillProduct } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";

import './SingleProductPurchase.css'

export default function SingleProductPurchase({ producto, cantidad, invalida, onCantidadChange })
{

    const fondo = invalida
        ? "#633333"
        : Number(cantidad) > 0
            ? "#4b7548"
            : "#ffffff09";

    return(

        <div className="singleProductPurchaseContainer" style={{ backgroundColor: fondo }}>
            <div className="singleProductPurchaseName">
                <AiFillProduct className="singleProductIcon"/>
                <p>{producto.nombre}</p>
            </div>
            <div className="singleProductPurchasePrice">
                <p>COP{" " + producto.precio}</p>
            </div>
            <div className="singleProductPurchaseStock">
                <p>Unidades disponibles: {" " + producto.stock}</p>
            </div>
            <FaShoppingCart />
            <p>:</p>
            <input 
                value={cantidad} 
                onChange={(e) => onCantidadChange(e.target.value)} 
                placeholder="Unidades" 
                type="number"
                className='singleProductPurchaseInput'/>
        </div>

    );

}