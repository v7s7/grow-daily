import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
    setError(""); // Clear old error first

    if (!email.trim()) {
      setError(language === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }
    
    if (!password) {
      setError(language === "ar" ? "يرجى إدخال كلمة المرور" : "Please enter your password");
      return;
    }
    
    if (isRegistering && password.length < 6) {
      setError(language === "ar"
        ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
        : "Password must be at least 6 characters");
      return;
    }
    
    if (isRegistering && !name.trim()) {
      setError(language === "ar" ? "يرجى إدخال الاسم" : "Please enter your name");
      return;
    }
    
  
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid), {
          name: name,
          email: email,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
  
      navigate("/home");
  
    } catch (err) {
      const msg = err.code;
    
      if (msg === "auth/invalid-email") {
        setError(language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address");
      } else if (msg === "auth/email-already-in-use") {
        setError(language === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email is already in use");
      } else if (msg === "auth/user-not-found" || msg === "auth/wrong-password") {
        setError(language === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Incorrect email or password");
      } else {
        setError(err.message); // fallback to Firebase message
      }
    }
    
  };
  
  return (
    <StyledWrapper>
      <div className="form-container">
      <div
  className="auth-page-container"
  dir={language === "ar" ? "rtl" : "ltr"} // ✅ this makes the CSS selector [dir="rtl"] work!
>
          <div style={{ padding: 10, textAlign: "center" }}>
            <h2 className="auth-title">{t[language].title}</h2>

            {isRegistering && (
              <FormControl label={t[language].name} value={name} setValue={setName} language={language} />
            )}
            <FormControl label={t[language].email} value={email} setValue={setEmail} type="email" language={language} />
            <FormControl label={t[language].password} value={password} setValue={setPassword} type="password" language={language} />
            {error && (
  <p
    style={{
      color: "red",
      fontSize: "13px",
      marginBottom: "10px",
      fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif",
    }}
  >
    {error}
  </p>
)}

            <div className="button-center">
              <button onClick={handleAuth}>{t[language].submit}</button>
            </div>

            <p
  onClick={() => setIsRegistering(!isRegistering)}
  style={{
    cursor: "pointer",
    color: "#f8cc6a",
    fontSize: language === "ar" ? "17px" : "14px",
  }}
>
  {language === "en"
    ? isRegistering
      ? "Already have an account? "
      : "Don't have an account? "
    : isRegistering
    ? "هل لديك حساب؟ "
    : "ليس لديك حساب؟ "}
  <span style={{ textDecoration: "underline" }}>
    {language === "en"
      ? isRegistering
        ? "Login"
        : "Register"
      : isRegistering
      ? "تسجيل الدخول"
      : "إنشاء حساب"}
  </span>
</p>



            <hr />

            <p>{language === "en" ? "Choose Language" : "اختر اللغة"}</p>
            <div className="lang-buttons">
  <button
    onClick={() => setLanguage("en")}
    style={{
      fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif"
    }}
  >
    English
  </button>
  <button
    onClick={() => setLanguage("ar")}
    style={{
      fontFamily: language === "ar" ? "'Cairo', sans-serif" : "'Poppins', sans-serif"
    }}
  >
    العربية
  </button>
</div>

          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const FormControl = ({ label, value, setValue, type = "text", language }) => (
  <div className="form-control">
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
    />
    <label>
      {language === "ar"
        ? <span>{label}</span>
        : label.split("").map((letter, i) => (
            <span key={i} style={{ transitionDelay: `${i * 50}ms` }}>
              {letter}
            </span>
          ))}
    </label>
  </div>
);

/* Wrapper for the whole container */
const StyledWrapper = styled.div`
    .auth-page-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 40px 30px;
      background-color: #10172a;
      border-radius: 12px;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
      color: white;
      text-align: center;
      width: 100%;  /* Make it fully responsive on small screens */
    }

    .form-control {
      position: relative;
      margin: 4px 0;
      width: 100%;
      max-width: 240px;
    }

    .form-control input {
      font-family: 'Poppins', sans-serif;
      background-color: transparent;
      border: 0;
      border-bottom: 2px solid #f8cc6a;
      display: block;
      width: 100%;
      padding: 8px 0;
      font-size: 14px;
      color: white;
      margin: 0;
      text-align: left;
    }

    .auth-page-container[dir="rtl"] .form-control input {
      text-align: right;
    }

    .auth-page-container[dir="rtl"] .form-control label {
      left: auto;
      right: 0;
      text-align: right;
    }

    .form-control input:focus,
    .form-control input:valid {
      outline: 0;
      border-bottom-color: lightblue;
    }

    .form-control label {
      position: absolute;
      top: 6px;
      left: 0;
      pointer-events: none;
    }

    .form-control label span {
      display: inline-block;
      font-size: 14px;
      min-width: 5px;
      color: #fff;
      transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .form-control input:focus + label span,
    .form-control input:valid + label span {
      color: lightblue;
      transform: translateY(-20px);
    }

    .auth-page-container p {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      color: #f8cc6a;
      margin-top: 10px;
      cursor: pointer;
    }

    .auth-page-container[dir="rtl"] p {
      font-size: 16px !important;
      font-family: 'Cairo', sans-serif !important;
      font-weight: bold;
    }

    .button-center button {
      color: #10172a;
      padding: 0.5em 2em;
      font-size: 18px;
      border-radius: 0.5em;
      background: #f8cc6a;
      cursor: pointer;
      border: 1px solid #f8cc6a;
      transition: all 0.3s;
      box-shadow: 2px 2px 8px #f8cc6a, -2px -2px 8px #f8cc6a;
      font-weight: bold;
    }

    .auth-page-container[dir="rtl"] .button-center button {
      font-size: 15px;
      padding: 0.4em 2.7em;
      font-family: 'Cairo', sans-serif !important;
    }

    .button-center button:active {
      color: #666;
      box-shadow: inset 4px 4px 12px #c5c5c5, inset -4px -4px 12px #ffffff;
    }

    .button-center button:hover {
      background-color: #ffdd88;
    }

    .lang-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 10px;
    }

    .lang-buttons button {
      color: #10172a;
      padding: 0.7em 1.7em;
      font-size: 16px;
      border-radius: 0.5em;
      background: #f8cc6a;
      cursor: pointer;
      border: 1px solid #f8cc6a;
      transition: all 0.3s;
      box-shadow: 2px 2px 8px #f8cc6a, -2px -2px 8px #f8cc6a;
      font-weight: bold;
      font-family: 'Poppins', sans-serif;
    }

    .auth-page-container[dir="rtl"] .lang-buttons button {
      font-family: 'Cairo', sans-serif !important;
    }

    .lang-buttons button:hover {
      background-color: #ffdd88;
    }

`;


export default AuthPage;
