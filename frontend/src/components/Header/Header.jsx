import React from "react";
import { Link } from "react-router-dom";

import './Header.css';
import { ReactComponent as Logo } from "../../img/logo.svg";


export const Header = (props) => {
    return (
        <header className="navbar">
            <Link to="/" className="logo-link">
                <Logo className="logo" />
            </Link>
            
            <div className="nav-buttons">
                <Link to={'/'} class="header-text">Главная</Link>
                <Link to={'/inctruction'} class="header-text">Инструкция</Link> 
                <Link to={'/scaning'} class="header-text">Сканировать</Link> 
            </div>
                        
        </header>
    )
}
