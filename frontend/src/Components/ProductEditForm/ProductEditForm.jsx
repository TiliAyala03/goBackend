import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import './ProductEditForm.css'

export default function ProductEditForm({ index, name, price, stock, setIndex, setName, setPrice, setStock, setFormActive })
{

    function closeForm()
    {

        setFormActive(false);

    }

    return(

        <div className='productEditFormBG'>
            <div className='productEditFormContainer'>

                <div className="productEditFormCloseDiv">
                    <IoMdClose className="productEditFormCloseIcon" onClick={() => closeForm()}/>
                </div>

                {index < 0 ? <h2>AÑADE UN PRODUCTO</h2> : <h2>EDITA UN PRODUCTO</h2>}
                <p>Asegúrate de llenar todos los campos</p>

            </div>
        </div>

    );

}