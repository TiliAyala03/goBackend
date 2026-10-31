import { useState } from "react";

import { AiFillProduct } from "react-icons/ai";
import { MdEdit } from "react-icons/md";


import './SingleProduct.css'

export default function SingleProduct({ product, stock, price, clickHandler, canBeEdited })
{

    return(

        <div className="singleProductContainer">
            <div className="singleProductName">
                <AiFillProduct className="singleProductIcon" style={{ fontSize: !canBeEdited && "15px"}}/>
                <p style={{ fontSize: !canBeEdited && "12px"}}>{product}</p>
            </div>
            <div className="singleProductPrice">
                <p style={{ fontSize: !canBeEdited && "12px"}} >COP {price}</p>
            </div>
            <div className="singleProductStock">
                <p>x{stock}</p>
            </div>
            {canBeEdited && <div className="singleProductEdit" onClick={clickHandler}>
                <p><MdEdit className="singleProductIcon2"/></p>
            </div>}

        </div>

    );

}