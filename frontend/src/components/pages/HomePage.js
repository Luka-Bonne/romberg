import React from "react"
import { Homepage1 } from "../Homepage-1/Homepage-1"
import { Homepage2 } from "../Homepage-2/Homepage-2"


export const HomePage = (props)  => {
    return (
        <div id="home-page">
            <Homepage1 />
            <Homepage2 />
        </div>  
    )
}
