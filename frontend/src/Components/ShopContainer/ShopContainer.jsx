import { useState } from "react";
import { CiShop } from "react-icons/ci";

import SingleProduct from "../SingleProduct/SingleProduct";

import './ShopContainer.css'
import ProductEditForm from "../ProductEditForm/ProductEditForm";

export default function ShopContainer({ tienda, setTienda, user })
{

    const[formActive, setFormActive] = useState(false);
        const[currentIndex, setCurrentIndex] = useState(-1);
        const[currentName, setCurrentName] = useState("");
        const[currentPrice, setCurrentPrice] = useState(0);
        const[currentStock, setCurrentStock] = useState(0);
    
        function addNew(index, name, price, stock)
        {
    
            setCurrentIndex(index);
            setCurrentName(name);
            setCurrentPrice(price);
            setCurrentStock(stock);
    
            setFormActive(true);
    
        }

    return(

        <div className="shopContainerMain">
            <div className="shopContainerViewer">
                <CiShop className="shopContainerIcon1"/>
                <h3>TIENDA DE {user.nombre.toUpperCase()}</h3>
                <div className="shopContainerInner">
                    {tienda.productos.map((producto, index) => (
                        <SingleProduct
                            key={index}
                            product={producto.nombre}
                            stock={producto.stock}
                            price={producto.precio}
                            clickHandler={() => addNew(index, producto.nombre, producto.precio, producto.stock)}
                        />
                    ))}
                </div>
            </div>
            <div className="shopContainerAddButton">
                <p onClick={() => addNew(-1, "", 0, 0)}>+   AÑADIR PRODUCTO</p>
            </div>
            {formActive && <ProductEditForm 
                                index={currentIndex}
                                name={currentName}
                                price={currentPrice}
                                stock={currentStock}
                                setName={setCurrentName}
                                setPrice={setCurrentPrice}
                                setStock={setCurrentStock}
                                setFormActive={setFormActive}
                                tienda={tienda}
                                setTienda={setTienda}/>}
        </div>

    );

}