import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100dvh;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: max(env(safe-area-inset-top, 0px), 24px) 24px max(env(safe-area-inset-bottom, 0px), 24px);
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 100%;
  max-width: 390px;
  background: #1C1C1E;
  border-radius: 24px;
  padding: 32px 28px;
  border: 1px solid rgba(84, 84, 88, 0.35);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

const LogoTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0 0 4px;
  color: #FFFFFF;
  span { color: #F5C533; }
`;

const LogoSub = styled.p`
  font-size: 15px;
  color: rgba(235, 235, 245, 0.5);
  margin: 0;
`;

const FormTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 24px;
  text-align: center;
`;

const Field = styled.div`
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 7px;
`;

const FieldInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 17px;
  font-family: inherit;
  background: #2C2C2E;
  color: #FFFFFF;
  border: 1.5px solid rgba(84, 84, 88, 0.4);
  border-radius: 12px;
  box-sizing: border-box;
  outline: none;
  -webkit-appearance: none;
  transition: border-color 0.2s ease;

  &::placeholder { color: rgba(235, 235, 245, 0.25); }
  &:focus { border-color: #F5C533; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 52px;
  background: #F5C533;
  color: #000000;
  font-size: 17px;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 0;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:active { transform: scale(0.96); opacity: 0.85; }
`;

const ErrorMsg = styled.p`
  font-size: 14px;
  color: #FF3B30;
  text-align: center;
  margin: 0 0 12px;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
`;

const SwitchRow = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const SwitchText = styled.p`
  font-size: 15px;
  color: rgba(235, 235, 245, 0.5);
  margin: 0;
`;

const SwitchLink = styled.span`
  color: #F5C533;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;

  &:hover { opacity: 0.8; }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(84, 84, 88, 0.45);
  margin: 24px 0;
`;

const LangRow = styled.div`
  display: flex;
  gap: 10px;
`;

const LangBtn = styled.button`
  flex: 1;
  height: 44px;
  background: ${props => props.$active ? 'rgba(245, 197, 51, 0.15)' : '#2C2C2E'};
  color: ${props => props.$active ? '#F5C533' : 'rgba(235, 235, 245, 0.6)'};
  border: 1.5px solid ${props => props.$active ? 'rgba(245, 197, 51, 0.45)' : 'rgba(84, 84, 88, 0.35)'};
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  margin: 0;
  padding: 0;

  &:active { transform: scale(0.96); }
`;

const LangLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  text-align: center;
  margin: 0 0 12px;
`;

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const t = {
    en: {
      login: "Sign In", register: "Create Account",
      email: "Email", password: "Password", name: "Your Name",
      submit_login: "Sign In", submit_register: "Create Account",
      switch_to_register: "Don't have an account?",
      switch_to_login: "Already have an account?",
      register_link: "Create one", login_link: "Sign in",
      lang_label: "Language",
    },
    ar: {
      login: "تسجيل الدخول", register: "إنشاء حساب",
      email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم",
      submit_login: "دخول", submit_register: "إنشاء حساب",
      switch_to_register: "ليس لديك حساب؟",
      switch_to_login: "هل لديك حساب؟",
      register_link: "أنشئ حساباً", login_link: "سجل الدخول",
      lang_label: "اللغة",
    },
  };

  const handleAuth = async () => {
    setError("");
    if (!email.trim()) { setError(language === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email"); return; }
    if (!password) { setError(language === "ar" ? "يرجى إدخال كلمة المرور" : "Please enter your password"); return; }
    if (isRegistering && password.length < 6) { setError(language === "ar" ? "كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters"); return; }
    if (isRegistering && !name.trim()) { setError(language === "ar" ? "يرجى إدخال الاسم" : "Please enter your name"); return; }
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await setDoc(doc(db, "users", cred.user.uid), { name, email });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/home");
    } catch (err) {
      const code = err.code;
      if (code === "auth/invalid-email") setError(language === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address");
      else if (code === "auth/email-already-in-use") setError(language === "ar" ? "البريد مستخدم بالفعل" : "Email is already in use");
      else if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") setError(language === "ar" ? "البريد أو كلمة المرور غير صحيحة" : "Incorrect email or password");
      else setError(err.message);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAuth(); };

  return (
    <Wrapper dir={language === "ar" ? "rtl" : "ltr"}>
      <Logo>
        <LogoTitle>Grow<span>Daily</span></LogoTitle>
        <LogoSub>{language === "ar" ? "بنِ عادات تدوم" : "Build habits that last"}</LogoSub>
      </Logo>

      <Card>
        <FormTitle>{isRegistering ? t[language].register : t[language].login}</FormTitle>

        {isRegistering && (
          <Field>
            <FieldLabel>{t[language].name}</FieldLabel>
            <FieldInput
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === "ar" ? "اسمك الكريم" : "Your full name"}
              autoComplete="name"
            />
          </Field>
        )}

        <Field>
          <FieldLabel>{t[language].email}</FieldLabel>
          <FieldInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "ar" ? "example@email.com" : "example@email.com"}
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field>
          <FieldLabel>{t[language].password}</FieldLabel>
          <FieldInput
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "ar" ? "••••••••" : "••••••••"}
            autoComplete={isRegistering ? "new-password" : "current-password"}
          />
        </Field>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <SubmitBtn onClick={handleAuth}>
          {isRegistering ? t[language].submit_register : t[language].submit_login}
        </SubmitBtn>

        <SwitchRow>
          <SwitchText>
            {isRegistering ? t[language].switch_to_login : t[language].switch_to_register}{" "}
            <SwitchLink onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>
              {isRegistering ? t[language].login_link : t[language].register_link}
            </SwitchLink>
          </SwitchText>
        </SwitchRow>

        <Divider />

        <LangLabel>{t[language].lang_label}</LangLabel>
        <LangRow>
          <LangBtn $active={language === "en"} onClick={() => setLanguage("en")}>English</LangBtn>
          <LangBtn $active={language === "ar"} onClick={() => setLanguage("ar")}>العربية</LangBtn>
        </LangRow>
      </Card>
    </Wrapper>
  );
}
