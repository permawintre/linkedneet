import React from "react"
import { loginEmail, signupEmail, loginGoogle } from './firebase.js'
import { Link } from "react-router-dom"
import './Auth.css'


//--------------------------signup--------------------------
export class Signup extends React.Component {
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


        signupEmail(this.state.email, this.state.pw)
        .then((result) => {

            document.location.href="/";
        })
        .catch((error) => console.log(error));

    }
  
    render() {
        return (

                <div className="body">
                    <form onSubmit={this.handleSubmit} className="body__inner">
                        <h2>이메일로 회원가입</h2>
                        <hr className="body__partition"></hr>
                        <div className="body__inputline">
                            <p className="body__inputline--description">이메일 주소</p>
                            <input className="body__inputline--input" type="text" value={this.state.email} placeholder="이메일 주소를 입력해 주세요" onChange={this.handleEmail} />
                        </div>
                        <div className="body__inputline">
                            <p className="body__inputline--description">비밀번호</p>
                            <input className="body__inputline--input" type="text" value={this.state.pw} placeholder="비밀번호를 입력해 주세요" onChange={this.handlePw} />
                        </div>
                        
                        <button type="submit" className="body__submitbtn">회원가입</button>
                        <Link to="/logIn" className="body__signup">로그인</Link>
                        <hr className="body__partition"></hr>
                        <Google/>
                    </form>
                </div>
            
        );
    }
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