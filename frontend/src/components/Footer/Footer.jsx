import React from 'react';

import './Footer.css'; 


export const Footer = () => {
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>О проекте</h3>
          <p>Краткое описание сайта.</p>
        </div>
        
        <div className="footer-section">
          <h3>Контакты</h3>
          <ul>
            <li>Email: romberg@example.com</li>
            <li>Телефон: +7 (123) 456-78-90</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Быстрые ссылки</h3>
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/inctruction">Инструкция</a></li>
            <li><a href="/scaning">Сканировать</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ромберговеденье.</p>
      </div>
    </footer>
  );
};