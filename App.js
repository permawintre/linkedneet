import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import { auth } from './firebase.js'
import { Header } from "./Header.js"
import { Home } from "./Home/Home.js"
import { Signup, Login} from "./Auth/Auth.js"
import { NotFound } from "./etc/Notfound.js"
import { Project } from "./ProjectPage/Project.js"
import { NeetCompany } from "./Neetcompany/NeetCompany.js"
import { Profile } from "./Profile/Profile.js"
import ProfileDetail from './Profile/ProfileDetail.js'


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
            <Route path="/profiledetail" element={<ProfileDetail/>}></Route>

            <Route path="/signUp" element={<Signup/>}></Route>
            <Route path="/logIn" element={<Login/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
    </div>

  )
}

export default App;