import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import './App.css'
import { auth } from './firebase.js'
import { Header } from "./Header.js"
import { Home } from "./Home/Home.js"
import { Signup, Login} from "./Auth/Auth.js"
import { NotFound } from "./etc/Notfound.js"
import { NeetCompany } from "./Neetcompany/NeetCompany.js"
import { Profile } from "./Profile/Profile.js"
import ProfileDetail from './Profile/ProfileDetail.js'
import { ProfileHeaderEdit } from './Profile/ProfileEdit.js'

import { Project } from "./ProjectPage/Project.js"
import { ProjectDetail } from './ProjectPage/ProjectDetail.js'
import { ProjectCreate } from './ProjectPage/ProjectCreate.js'
import { ProjectJoin } from './ProjectPage/ProjectJoin.js'
import { ProjectManage } from './ProjectPage/ProjectManage.js'
import { ProjectHome } from './ProjectPage/ProjectHome.js'

import ProfileCareerDetail from './Profile/ProfileCareerDetail.js'

function App() {

    const [init, setInit] = useState(false); 
    const navigate = useNavigate();
    // 처음에는 false이고 나중에 사용자 존재 판명이 모두 끝났을 때 true를 통해 해당 화면을 render
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [authObj, setAuthObj] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => { // user 판명을 듣고 
        if(user) { // 있으면
          setIsLoggedIn(true); // 로그인 됨
          setAuthObj(user);
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
<<<<<<< HEAD
            <Route path="/neetCompany" element={isLoggedIn ? <NeetCompany/> : <RedirectToLogIn/>}></Route>
            <Route path="/profile" element={isLoggedIn ? <Profile/> : <RedirectToLogIn/>}></Route>
=======
            <Route path="/projectdetail/:projectId" element={isLoggedIn ? <ProjectDetail/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectjoin/:projectId" element={isLoggedIn ? <ProjectJoin/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectcreate" element={isLoggedIn ? <ProjectCreate/> : <RedirectToLogIn/>}></Route>
            <Route path="/projectmanage/:projectId" element={isLoggedIn ? <ProjectManage/>: <RedirectToLogIn/>}></Route>
            <Route path="/projecthome/:projectId" element={isLoggedIn ? <ProjectHome/>: <RedirectToLogIn/>}></Route>

            <Route path="/neetCompany" element={isLoggedIn ? <NeetCompany/> : <RedirectToLogIn/>}></Route>
            <Route path="/profile" element={isLoggedIn ? <Profile/> : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail" element={isLoggedIn ? <ProfileDetail/> : <RedirectToLogIn/>}></Route>
            <Route path="/profiledetail/career" element={<ProfileCareerDetail/>}></Route>

            <Route path="/profileheaderedit" element={isLoggedIn ? <ProfileHeaderEdit authObj = {authObj}/> : <RedirectToLogIn/>}></Route>
>>>>>>> hojun

            <Route path="/signUp" element={<Signup/>}></Route>
            <Route path="/logIn" element={<Login/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
    </div>

  )
}

<<<<<<< HEAD






















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




















=======
>>>>>>> hojun
export default App;