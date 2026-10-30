import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import './ProductEditForm.css'

export default function ProductEditForm({ index, name, price, stock, setName, setPrice, setStock, setFormActive, tienda, setTienda })
{

    const [error, setError] = useState("")

    function closeForm()
    {

        setFormActive(false);

    }

    async function handleSubmit(e)
    {

        e.preventDefault();
        setError("");

        if(name == "" || price == "" || stock == "" || price < 0 || stock < 0)
        {
            setError("Algunos campos introducidos son inválidos")
            return;
        }

        if(!Number.isInteger(Number(price)) || !Number.isInteger(Number(stock)))
        {
            setError("El precio y el stock deben ser números enteros")
            return;
        }

        const producto = { nombre: name, precio: Number(price), stock: Number(stock) };

        let nuevosProductos;
        if (index < 0)
            nuevosProductos = [...tienda.productos, producto];
        else
            nuevosProductos = tienda.productos.map((p, i) => i === index ? { ...p, ...producto } : p);

        const nuevaTienda = { ...tienda, productos: nuevosProductos };

        try
        {
            const res = await fetch("http://localhost:8081/tienda", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaTienda)
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);

            setTienda(data);
            setFormActive(false);
        }
        catch (err)
        {
            console.error("Fallo guardando tienda:", err);
            setError("No se pudo conectar con el servidor");
        }

    } 

    return(

        <div className='productEditFormBG'>
            <div className='productEditFormContainer'>

                <div className="productEditFormCloseDiv">
                    <IoMdClose className="productEditFormCloseIcon" onClick={() => closeForm()}/>
                </div>

                {index < 0 ? <h2>AÑADE UN PRODUCTO</h2> : <h2>EDITA UN PRODUCTO</h2>}
                <p>Asegúrate de llenar todos los campos</p>

                <div className='productEditFormInnerContainer'>
                    <form className='productEditForm' onSubmit={handleSubmit}>
                        <p className="productEditFormLittleP">NOMBRE DEL PRODUCTO</p>
                        <input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Nombre del producto" 
                            className='editProductFormInputField'/>
                        <p className="productEditFormLittleP">PRECIO DE LA UNIDAD</p>
                        <input 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            placeholder="Precio de la Unidad"
                            type="number"
                            className='editProductFormInputField'/>
                        <p className="productEditFormLittleP">CANTIDAD DE STOCK</p>
                        <input 
                            value={stock} 
                            onChange={(e) => setStock(e.target.value)} 
                            placeholder="Stock" 
                            type="number"
                            className='editProductFormInputField'/>
                        <p className="productEditFormError">{error}</p>
                        <button type="submit" className='editProductFormButton'>GUARDAR</button>
                    </form>
                </div>

            </div>
        </div>

    );

}