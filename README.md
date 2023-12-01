# LinkedNeet
![스크린샷 2023-11-30 195213](https://github.com/permawintre/linkedneet/assets/89758947/28877466-8078-4b6d-bf52-d137d0a5c81a)
*<p align="center">"무업기간 청년들의 연결망 - 니트생활자"</p>*


<b>니트컴퍼니</b>는 백수들이 운영하는 가상회사입니다.

건물, 월급, 사업자는 없지만 회사놀이를 통해 무업기간을 전환의 기간으로 보낼 수 있도록 응원합니다. [니트컴퍼니 자세히 알아보기](https://neetpeople.kr/Home)

<b>링크드닛</b>은 니트컴퍼니를 넘어 청년들을 연결하는 플랫폼입니다.

청년들은 링크드닛을 통해 자신을 알아보고, 타인과의 커넥션을 형성하며 공동체를 형성할 수 있습니다.

## Contents
- [Settings](#settings)
- [Application](#application)
- [Demo](#demo)
- [Build](#build)
- [Team](#team)

## Settings
- FE: React 18.2.0
- BE: Firebase 10.4.0

## Application
본 사이트는 니트컴퍼니 회원만 이용가능하며, 관리자의 승인을 통해 가입할 수 있습니다.

관리자는 별도의 계정으로 니트컴퍼니 및 회원들을 관리할 수 있습니다.

![image](https://github.com/permawintre/linkedneet/assets/89758947/10aee6dd-06c7-4e83-ba9e-8a1a17f037d2)


- 니트컴퍼니
  - 니트컴퍼니는 기수제로 운영되며, 기수별 스레드에서 활동합니다.
- 프로필
  - 나를 소개하세요!
  - 프로필을 이용해 자유롭게 본인을 소개합니다.
- 소모임
  - 취미, 관심사, 또는 목표를 공유하는 사람들과 함께 모여 활동합니다.
  - 원하는 소모임을 생성할 수 있고, 니트컴퍼니 회원들과 커넥션을 형성할 수 있습니다.
- 관리자
  - 니트컴퍼니 회원을 관리할 수 있고, 업무인증 관리를 효율적으로 할 수 있습니다.
  - 공지사항 작성 권한이 있습니다.


## Demo
[linkedneet.web.app
](https://linkedneet.web.app/)

## Build
1. 레포지토리 clone
2. dependency 설치
```
npm install
```
3. Firebase 프로젝트 설정
- firebase 콘솔에서 새 프로젝트를 생성하고 웹 앱을 추가한다.
- firebase SDK 구성 객체를 설정하고, '.env' 파일을 프로젝트 루트에 추가한다.
- 검색 엔진으로 사용하는 algolia의 application-id와 api-key도 '.env'에 추가한다. 
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_ALGOLIA_ID=your-algolia-application-id
REACT_APP_ALGOLIA_SEARCH_KEY=your-algolia-api-key
```
4. Firebase CLI 설치
```
npm install -g firebase-tools
```
5. Firebase 로그인 및 초기화
- 초기화 과정에서 호스팅을 선택하고, 프로젝트 설정을 따라 진행한다.
```
firebase login
firebase init
```
6. 빌드 및 배포
```
npm run build
firebase deploy
```
 

## Team
|팀원|소속|이메일|Github ID|
|---|---|---|---|
|이다래|School of Computing, KAIST|2darae@kaist.ac.kr|darae-lee|
|김호준|School of Computing, KAIST|khf7000@kaist.ac.kr|khf7000|
|이영도|School of Computing, KAIST|lyd0531@kaist.ac.kr|leeyngdo|
|김서경|Bio and Brain Engineering, KAIST|seokyung1114@kaist.ac.kr|seokyung1114|
|김호준|School of Computing, KAIST|juns0220@kaist.ac.kr|kim-hojoon|
|이영진|School of Computing, KAIST|ligobservatory@kaist.ac.kr|permawintre|
