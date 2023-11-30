import React, { useState } from "react"
import { loginEmail, loginGoogle, auth, dbService } from '../firebase.js'
import { Link } from "react-router-dom"
import { collection, setDoc, doc, query, where, getDocs, getDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth";
import './Auth.css'


export const Signup = () => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [generation, setGeneration] = useState(''); // 기수
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');

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

    const onChangeTel = (e) => {
        setTel(e.target.value);
    }

    const onChangeName = (e) => {
        setName(e.target.value);
    }
    
    const onSubmit = async (event) => {
        event.preventDefault();
        // SignUp
        const userRef = collection(dbService, "users");

        const nicknameQuery = query(userRef, where("nickname", "==", nickname));
        const nicknameQuerySnapshot = await getDocs(nicknameQuery);
        if (!nicknameQuerySnapshot.empty) {
            // Nickname already exists, handle the error
            alert("이미 사용 중인 닉네임입니다.");
            return;
        }

        if( generation < 1 || generation > 20) {
            alert("올바르지 않은 기수입니다");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
        .then(async(userCredential) => {
            // add initial profile for user (key = uid) 
            // doc (userRef, __SOME KEY__) => add new default profile if login.
            // in this situation, key is uid in in authobj

            await setDoc(doc(userRef, auth.currentUser.uid), {
                // user profile header
                name: name,
                nickname: nickname,
                email: email,
                generation: generation,
                facebook: "",
                instagram: "",
                tel: tel,

                // following 
                followers: [],
                followings: [],
                
                level: 0,
                
                // uid 
                uid: auth.currentUser.uid
            });
            
            // move to home if singup is successful
            document.location.href="/";
        })
        .catch((error) => { 
            switch (error.code) {
                case "auth/user-not-found" || "auth/wrong-password":
                  alert("이메일 혹은 비밀번호가 일치하지 않습니다.");
                  break;
                case "auth/email-already-in-use":
                  alert("이미 사용 중인 이메일입니다.");
                  break;
                case "auth/weak-password":
                  alert("비밀번호는 6글자 이상이어야 합니다.");
                  break;
                case "auth/network-request-failed":
                  alert("네트워크 연결에 실패 하였습니다.");
                  break;
                case "auth/invalid-email":
                  alert("잘못된 이메일 형식입니다.");
                  break;
                case "auth/internal-error":
                  alert("잘못된 요청입니다.");
            }
        });
    }

    return (
        <div className="signupbody">
            <form onSubmit={onSubmit} className="signup__body__inner">
                <h2>이메일로 회원가입</h2>
                <hr className="signup__body__partition"></hr>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">이름</p>
                    <input className="signup__body__inputline--input" name="name" type="text" value={name} placeholder="이름을 입력해 주세요" onChange={onChangeName} />
                </div>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">전화번호</p>
                    <input className="signup__body__inputline--input" name="name" type="text" value={tel} placeholder="전화번호를 입력해 주세요" onChange={onChangeTel} />
                </div>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">이메일 주소</p>
                    <input className="signup__body__inputline--input" name="email" type="text" value={email} placeholder="이메일 주소를 입력해 주세요" onChange={onChangeEmail} />
                </div>
                <div className="signup__body__inputline">
                    <p className="signup__body__inputline--description">비밀번호</p>
                    <input className="signup__body__inputline--input" type="password" value={password} placeholder="비밀번호를 입력해 주세요" onChange={onChangePassword} />
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
        .catch((error) => {
            switch (error.code) {
                case "auth/user-not-found" || "auth/wrong-password":
                  return "이메일 혹은 비밀번호가 일치하지 않습니다.";
                case "auth/email-already-in-use":
                  return "이미 사용 중인 이메일입니다.";
                case "auth/weak-password":
                  return "비밀번호는 6글자 이상이어야 합니다.";
                case "auth/network-request-failed":
                  return "네트워크 연결에 실패 하였습니다.";
                case "auth/invalid-email":
                  return "잘못된 이메일 형식입니다.";
                case "auth/internal-error":
                  return "잘못된 요청입니다.";
                default:
                  return "로그인에 실패 하였습니다.";
              }
        });
    }

    render() {
        return (
            <div className="signin__body">
                <form onSubmit={this.handleSubmit} className="signin__body__inner">
                    <h2>이메일로 로그인</h2>
                    <hr className="signin__body__partition"></hr>
                    <div className="signin__body__inputline">
                        <p className="signin__body__inputline--description">이메일 주소</p>
                        <input className="signin__body__inputline--input" type="text" value={this.state.email} placeholder="이메일 주소를 입력해 주세요" onChange={this.handleEmail} />
                    </div>
                    <div className="signin__body__inputline">
                        <p className="signin__body__inputline--description">비밀번호</p>
                        <input className="signin__body__inputline--input" type="password" value={this.state.pw} placeholder="비밀번호를 입력해 주세요" onChange={this.handlePw} />
                    </div>
                    
                    <button type="submit" className="signin__body__submitbtn">로그인</button>
                    <Link to="/signUp" className="signin__body__signup">회원가입</Link>
                    <hr className="signin__body__partition"></hr>
                    <Google/>
                </form>
            </div>
        );
    }
}


export const GoogleSignup = () => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [generation, setGeneration] = useState(''); // 기수
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');

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
    
    
    const onChangeTel = (e) => {
        setTel(e.target.value);
    }

    const onChangeName = (e) => {
        setName(e.target.value);
    }
    

    const onSubmit = async (event) => {
        event.preventDefault();
        // SignUp
        const userRef = collection(dbService, "users");

        const nicknameQuery = query(userRef, where("nickname", "==", nickname));
        const nicknameQuerySnapshot = await getDocs(nicknameQuery);
        if (!nicknameQuerySnapshot.empty) {
            // Nickname already exists, handle the error
            alert("이미 사용 중인 닉네임입니다.");
            return;
        }

        if( generation < 1 || generation > 20) {
            alert("올바르지 않은 기수입니다");
            return;
        }

        await setDoc(doc(userRef, auth.currentUser.uid), {
            // user profile header
            nickname: nickname,
            email: email,
            generation: generation,
            facebook: "",
            instagram: "",
            tel: "",

            // following 
            followers: [],
            followings: [],

            // user approve state
            /*
             * Level 0 : Default State. 회원 가입 시 준회원 
             * Level 1 : After approve. 관리자 승인 이후 정회원
             * Level 2 : 관리자 레벨?
             */
            level: 0,

            // uid 
            uid: auth.currentUser.uid
        });
            
        // move to home if singup is successful
        document.location.href="/";
    }

    return (
        <div className="google_signupbody">
            <form onSubmit={onSubmit} className="google_signup__body__inner">
                <h2>기본 정보를 입력해주세요</h2>
                <hr className="google_signup__body__partition"></hr>
                <div className="google_signup__body__inputline">
                    <p className="google_signup__body__inputline--description">이름</p>
                    <input className="google_signup__body__inputline--input" name="name" type="text" value={name} placeholder="이름을 입력해 주세요" onChange={onChangeName} />
                </div>
                <div className="google_signup__body__inputline">
                    <p className="google_signup__body__inputline--description">이메일 주소</p>
                    <input className="google_signup__body__inputline--input" name="email" type="text" value={email} placeholder="이메일 주소를 입력해 주세요" onChange={onChangeEmail} />
                </div>
                <div className="google_signup__body__inputline">
                    <p className="google_signup__body__inputline--description">전화번호</p>
                    <input className="google_signup__body__inputline--input" name="name" type="text" value={tel} placeholder="전화번호를 입력해 주세요" onChange={onChangeTel} />
                </div>
                <div className="google_signup__body__inputline">
                    <p className="google_signup__body__inputline--description">닉네임</p>
                    <input className="google_signup__body__inputline--input" type="text" value={nickname} placeholder="닉네임을 입력해주세요" onChange={onChangeNickname} />
                </div>

                <div className="google_signup__body__inputline">
                    <p className="google_signup__body__inputline--description">니트컴퍼니 기수</p>
                    <input className="google_signup__body__inputline--input" type="text" value={generation} placeholder="기수를 입력해주세요 ex)12기 -> 12" onChange={onChangeGeneration} />
                </div>
                
                <button type="submit" className="google_signup__body__submitbtn">회원가입</button>
                <Link to="/logIn" className="google_signup__body__signup">로그인</Link>
                <hr className="google_signup__body__partition"></hr>
                <Google/>
            </form>
        </div>
        
    );
}

//--------------------------google--------------------------
export const Google = () => {
    const [isInit, setIsInit] = useState(true);

    return(
        <div class="google-btn" onClick={ ()=> {
            loginGoogle()
            .then(async (result) => {
                const userRef = doc(dbService, "users", auth.currentUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const { uid } = docSnap.data() || {};
                    if (uid) {
                        setIsInit(false);
                    }
                } else {
                    setIsInit(true);
                }

                if (isInit) {
                    document.location.href="/google_signup"; 
                } else {
                    document.location.href="/"; 
                }
            })
            .catch((error) => console.log(error));
        }}>
            <div class="google-icon-wrapper">
                <img class="google-icon" src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="google icon"/>
            </div>
            <p class="btn-text"><b>Sign in with google</b></p>
        </div>
    )
}