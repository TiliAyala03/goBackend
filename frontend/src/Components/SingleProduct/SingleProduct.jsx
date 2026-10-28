import { useState } from "react";

import { AiFillProduct } from "react-icons/ai";
import { MdEdit } from "react-icons/md";


import './SingleProduct.css'

export default function SingleProduct({ product, stock, price, clickHandler })
{

    return(

        <div className="singleProductContainer">
            <div className="singleProductName">
                <AiFillProduct className="singleProductIcon"/>
                <p>{product}</p>
            </div>
            <div className="singleProductPrice">
                <p>COP {price}</p>
            </div>
            <div className="singleProductStock">
                <p>x{stock}</p>
            </div>
            <div className="singleProductEdit" onClick={clickHandler}>
                <p><MdEdit className="singleProductIcon2"/></p>
            </div>

        </div>

    );

}