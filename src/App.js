import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import { auth } from './firebase.js'
import { Header } from "./Header.js"
import { Home } from "./Home.js"
import { Signup, Login} from "./Auth.js"
import { NotFound } from "./Notfound.js"
import { Project } from "./Project.js"
import { NeetCompany } from "./NeetCompany.js"
import { Profile } from "./Profile.js"


function App() {

    const [init, setInit] = useState(false); 
    const navigate = useNavigate();
    // 처음에는 false이고 나중에 사용자 존재 판명이 모두 끝났을 때 true를 통해 해당 화면을 render
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    useEffect(() => {
      auth.onAuthStateChanged((user) => { // user 판명을 듣고 
        if(user) { // 있으면
          setIsLoggedIn(true); // 로그인 됨
        } else {
          setIsLoggedIn(false); // 로그인 안됨
        }
        setInit(true); // user 판명 끝
      });
    }, [])

    let loggedIn = init && isLoggedIn;

    const RedirectToLogIn = () => {

        navigate("/logIn");
    }




  return(

    <div className="background">
        <Header/>
        <Routes>
            <Route path="/" element={isLoggedIn ? <Home/> : <RedirectToLogIn/>}></Route>
            <Route path="/project" element={isLoggedIn ? <Project/> : <RedirectToLogIn/>}></Route>
            <Route path="/neetCompany" element={isLoggedIn ? <NeetCompany/> : <RedirectToLogIn/>}></Route>
            <Route path="/profile" element={isLoggedIn ? <Profile/> : <RedirectToLogIn/>}></Route>

            <Route path="/signUp" element={<Signup/>}></Route>
            <Route path="/logIn" element={<Login/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
    </div>

  )
}























/*

//로그인 부분
const buttons = document.getElementById('buttons');

//Email 로그인, 회원가입 구현
buttons.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.id == 'signin') {
        loginEmail(email.value, pw.value).then((result) => {
            console.log(result);
            const user = result.user;
            loginSuccess(user.email, user.uid);
        });
    } else if (e.target.id == 'signup') {
        signupEmail(email.value, password.value)
        .then((result) => {
            const user = result.user;
            loginSuccess(user.email, user.uid);
        })
        .catch((error) => console.log(error));
    }
});
//Google 로그인
google.addEventListener('click', (e) => {
    loginGoogle().then((result) => {
        console.log(result);
        const user = result.user;
        loginSuccess(user.email, user.uid);
    });
});
//로그인 성공시 UI 변경
const loginSuccess = (email, uid) => {
    const login_area = document.getElementById('login-area');
    login_area.innerHTML = `<h2>Login 성공!</h2><div>uid: ${uid}</div><div>email: ${email}</div>`;
};



*/




















export default App;