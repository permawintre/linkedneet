import React, { useState } from "react"
import { loginEmail, loginGoogle, auth, db } from '../firebase.js'
import { Link } from "react-router-dom"
import { collection, setDoc, doc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth";
import './Auth.css'


//--------------------------signup--------------------------
export const Signup = () => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [generation, setGeneration] = useState(''); // 기수

    // get an Email value from user.
    const onChangeEmail = (e) => {
        // need to check email (양식, 중복)
        setEmail(e.target.value);
    }

    // get a Password from user
    const onChangePassword = (e) => {
        // need to check password (weak password)
        setPassword(e.target.value);
    }

    // get a Nickname from user
    const onChangeNickname = (e) => {
        // need to check nickname (중복, 글자 수)
        setNickname(e.target.value);
    }

    // get a Generation from user
    const onChangeGeneration = (e) => {
        // need to check generation (숫자 parsing)
        setGeneration(e.target.value);
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        // SignUp
        createUserWithEmailAndPassword(auth, email, password)
        .then(async(userCredential) => {
            // user Table attribute
            let userObj = {
                nickname: nickname,
                email: email,
                generation: generation,
                website: "",
                instagram:"",
                facebook:"",
                tel:"",
            };
            
            // add initial profile for user (key = uid)
            const userRef = collection(db, "users");
            
            // doc (userRef, __SOME KEY__) => add new default profile if login.
            // in this situation, key is uid in in authobj
            await setDoc(doc(userRef, auth.currentUser.uid), {
                nickname: userObj.nickname,
                email: userObj.email,
                generation: userObj.generation,
                website: userObj.website,
                instagram: userObj.instagram,
                facebook: userObj.facebook,
                tel: userObj.tel,
            });
            
            // move to home if singup is successful
            document.location.href="/";
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="signupbody">
            <form onSubmit={onSubmit} className="signup__body__inner">
                <h2>이메일로 회원가입</h2>
                <hr className="signup__body__partition"></hr>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">이메일 주소</p>
                    <input className="signup__body__inputline--input" name="email" type="text" value={email} placeholder="이메일 주소를 입력해 주세요" onChange={onChangeEmail} />
                </div>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">비밀번호</p>
                    <input className="signup__body__inputline--input" type="text" value={password} placeholder="비밀번호를 입력해 주세요" onChange={onChangePassword} />
                </div>

                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">닉네임</p>
                    <input className="signup__body__inputline--input" type="text" value={nickname} placeholder="닉네임을 입력해주세요" onChange={onChangeNickname} />
                </div>

                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">니트컴퍼니 기수</p>
                    <input className="signup__body__inputline--input" type="text" value={generation} placeholder="기수를 입력해주세요 ex)12기 -> 12" onChange={onChangeGeneration} />
                </div>
                
                <button type="submit" className="signup__body__submitbtn">회원가입</button>
                <Link to="/logIn" className="signup__body__signup">로그인</Link>
                <hr className="signup__body__partition"></hr>
                <Google/>
            </form>
        </div>
        
    );
}

//--------------------------login--------------------------
export class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', pw: ''};
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePw = this.handlePw.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleEmail(event) {
        this.setState({email: event.target.value});
    }
    handlePw(event) {
        this.setState({pw: event.target.value});
    }
  
    handleSubmit(event) {
        event.preventDefault();


        loginEmail(this.state.email, this.state.pw)
        .then((result) => {

            document.location.href="/";
        })
        .catch((error) => console.log(error));
    }

    render() {
        return (
            <div className="body">
                <form onSubmit={this.handleSubmit} className="body__inner">
                    <h2>이메일로 로그인</h2>
                    <hr className="body__partition"></hr>
                    <div className="body__inputline">
                        <p className="body__inputline--description">이메일 주소</p>
                        <input className="body__inputline--input" type="text" value={this.state.email} placeholder="이메일 주소를 입력해 주세요" onChange={this.handleEmail} />
                    </div>
                    <div className="body__inputline">
                        <p className="body__inputline--description">비밀번호</p>
                        <input className="body__inputline--input" type="text" value={this.state.pw} placeholder="비밀번호를 입력해 주세요" onChange={this.handlePw} />
                    </div>
                    
                    <button type="submit" className="body__submitbtn">로그인</button>
                    <Link to="/signUp" className="body__signup">회원가입</Link>
                    <hr className="body__partition"></hr>
                    <Google/>
                </form>
            </div>
        );
    }
}

//--------------------------google--------------------------
export const Google = () => {

    return(
   
        <div class="google-btn" onClick={ ()=>{
            loginGoogle()
            .then((result) => { document.location.href="/"; })
            .catch((error) => console.log(error));
        }}>
            <div class="google-icon-wrapper">
                <img class="google-icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="google icon"/>
            </div>
            <p class="btn-text"><b>Sign in with google</b></p>
        </div>
    )
}