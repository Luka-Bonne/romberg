import React from "react";

import './Homepage-1.css';

import home1pict from "../../img/home-pict-1.jpg";

export const Homepage1 = (props) => {
    return (
        <div class="hp-1">
            <div class="left-side">
                <div class="hp-text">
                    <h1 class="hp-font">Ромберговеденье</h1>
                    <h3 class="hp-font" id="hp-blue">Поможем оценить чувство <br/> равновесия</h3>
                </div>
                <div class="hp-buttons">
                    <button id="hp-button-first">Попробовать сейчас</button>
                    <button id="hp-button-second">Подробнее →</button>
                </div>
            </div>
            <div class="right-side">
                <img src={home1pict} id="img-hp" alt="Ромбик релаксирует"></img>
            </div>
        </div>
    )
}
