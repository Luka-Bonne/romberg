import React from "react";

import { InstructionCard } from "../InstructionCard/InstructionCard";
import "./styles/InstructionPage.css"; 

import step1 from "../../img/step-1.png";
import step2 from "../../img/step-2.png";
import step3 from "../../img/step-3.png";
import step4 from "../../img/step-4.png";
import step5 from "../../img/step-5.png";
import step6 from "../../img/step-6.png";
import step7 from "../../img/step-7.png";
import step8 from "../../img/step-8.png";


const cardsData = [
  {
    id: 1,
    imageUrl: step1,
    title: "Шаг 1",
    description: "Включить камеру."
  },
  {
    id: 2,
    imageUrl: step2,
    title: "Шаг 2",
    description: "Расположиться так, чтобы на камере вы были хорошо освещены."
  },
  {
    id: 3,
    imageUrl: step3,
    title: "Шаг 3",
    description: "Встать на однотонном светлом фоне, чтобы на камере лучше определялось ваше тело."
  },
  {
    id: 4,
    imageUrl: step4,
    title: "Шаг 4.1",
    description: "В кадр должно попадать полностью ваше тело, то есть и ноги, и голова должны быть видны в кадре."
  },
  {
    id: 5,
    imageUrl: step5,
    title: "Шаг 4.2",
    description: "Но можно и так, чтобы записалось только туловище, то есть всё, что выше середины бедра и до шеи."
  },
  {
    id: 6,
    imageUrl: step6,
    title: "Шаг 5",
    description: "Для записи видео нужно встать в пробу Ромберга: встать прямо, ноги вместе, руки вытянуты перед собой и раздвинуты в стороны примерно на 45 градусов."
  },
  {
    id: 7,
    imageUrl: step7,
    title: "Шаг 6",
    description: "Первое видео нужно записать, стоя в пробе ромберга с открытыми глазами."
  },
  {
    id: 8,
    imageUrl: step8,
    title: "Шаг 7",
    description: "Второе видео нужно записать, стоя в пробе ромберга с закрытыми глазами."
  }
];


export const InstructionPage = (props) => {
  return (
    <div id="instruction-page">
      <h1>Как правильно использовать приложение?</h1>
      <div className="cards-container">
        {cardsData.map((card) => (
          <InstructionCard key={card.id} imageUrl={card.imageUrl} title={card.title} description={card.description} />
        ))}
      </div>
      <div>
        <p>Записывать видео нужно 1 минуту. Как только время записи закончится, приложение само остановит запись.</p>
        <p>Записанные видео нужно отправить на обработку, после обработки откроется страница с графиком и результатами оценки по видео.</p>
      </div>
    </div>
  );
};