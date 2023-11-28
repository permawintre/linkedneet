// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { 
    getAuth,// authentication 설정
    signInWithPopup, //google 로그인을 팝업창에 띄우기 위해
    GoogleAuthProvider, //google login 기능
    signInWithEmailAndPassword,// email 로그인
    createUserWithEmailAndPassword, //email 회원가입
    signOut // 로그아웃
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbc0uGNJed1FkwhfRCFdTXbdwM92sflLw",
  authDomain: "linkedneet.firebaseapp.com",
  projectId: "linkedneet",
  storageBucket: "linkedneet.appspot.com",
  messagingSenderId: "165076434428",
  appId: "1:165076434428:web:f9645b0dde706ef1160679"
};




// Initialize Firebase
initializeApp(firebaseConfig);
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const dbService = getFirestore(app);
export const storage = getStorage(app);

//Email 로그인
export const loginEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};
  
//Email 회원가입
export const signupEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};



//Google 로그인
const provider = new GoogleAuthProvider();
export const loginGoogle = () => {
    return signInWithPopup(auth, provider);
};




//로그아웃
export const logOut = () => {

    signOut(auth).then(() => {
        // Sign-out successful.
        document.location.href="/logIn";
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
    
}