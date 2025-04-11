import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const t = {
    en: {
      title: isRegistering ? "Register" : "Login",
      email: "Email :",
      password: "Password :",
      name: "Your Name :",
      switch: isRegistering ? "Already have an account? Login" : "Don't have an account? Register",
      submit: isRegistering ? "Sign Up" : "Sign In",
    },
    ar: {
      title: isRegistering ? "تسجيل حساب" : "تسجيل دخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      name: "اسمك :",
      switch: isRegistering ? "هل لديك حساب؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب",
      submit: isRegistering ? "إنشاء" : "دخول",
    },
  };

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, {
          displayName: name,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "/home";
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="task-page-container">
      <div
        style={{
          padding: 10,
          direction: language === "ar" ? "rtl" : "ltr",
          textAlign: "left",
        }}
      >
        <h2 className="auth-title">{t[language].title}</h2>

        {isRegistering && (
          <div className="form-group">
            <label>{t[language].name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>{t[language].email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t[language].password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="button-center">
          <button onClick={handleAuth}>{t[language].submit}</button>
        </div>

        <p
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ cursor: "pointer" }}
        >
          {t[language].switch}
        </p>

        <hr />

        <p>{language === "en" ? "Choose Language" : "اختر اللغة"}</p>
        <button onClick={() => setLanguage("en")}>English</button>
        <button onClick={() => setLanguage("ar")}>العربية</button>
      </div>
    </div>
  );
}
