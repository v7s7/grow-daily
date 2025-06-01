import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function NavBar({ language = "en" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const t = {
    en: {
      home: "Home",
      aquarium: "Aquarium",
      settings: "Settings",
      todo: "To-Do List",
      title: "GrowDaily",
      Calendar:"Calendar"
    },
    ar: {
      home: "الرئيسية",
      aquarium: "الحوض",
      settings: "الإعدادات",
      todo: "قائمة المهام",
      title: "GrowDaily",
      Calendar : "التقويم"
    },
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="navbar"> {/* ✅ wrap everything inside this */}
      <div className="hamburger-container">
        <div
          className="logo"
          style={{ cursor: "pointer", minWidth: "100px", textAlign: "left" }}
          onClick={() => navigate("/home")}
        >
          {t[language].title}
        </div>
        <div className="hamburger" onClick={toggleMenu}>☰</div>
      </div>

      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={closeMenu}>×</div>
        <span onClick={() => { navigate("/home"); closeMenu(); }}>{t[language].home}</span>
        {/* <span onClick={() => { navigate("/aquarium"); closeMenu(); }}>{t[language].aquarium}</span> */}
        <span onClick={() => { navigate("/calendar"); closeMenu(); }}>{t[language].Calendar}</span>
        <span onClick={() => { navigate("/todolist"); closeMenu(); }}>{t[language].todo}</span>
        <span onClick={() => { navigate("/eisenhower"); closeMenu(); }}>
          {language === "ar" ? "التحكم بالمهام" : "Task Control"}
        </span>
        <span onClick={() => { navigate("/settings"); closeMenu(); }}>{t[language].settings}</span>
      </div>

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}
    </div>
  );
}
