# 🐾 Dogstagram - React & Express 기반 SNS

## 💡 프로젝트 소개
Dogstagram은 **React**, **Express**, **MySQL**을 활용하여 개발한 인스타그램 스타일의 SNS 웹 애플리케이션입니다.  
제한된 시간 내 기능 중심의 구현을 목표로 하였으며, UI는 인스타그램을 참고하여 설계하였습니다.

---

## 🗓 개발 기간
2025.05.07 ~ 2025.05.16

---

## 🛠️ 기술 스택

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=websocket&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)



---

## 📑 주요 기능 및 페이지 구성

### 1. 🔐 로그인 & 회원가입
- JWT 기반 인증
- 아이디 중복 체크 (Blur 이벤트)
- 로그인 실패 시 에러 메시지 출력

### 2. 🏠 메인 피드 페이지
- 게시물 10개 단위 무한 스크롤
- 게시일을 분/시/일/달 단위로 표시
- 다중 이미지 슬라이드 지원 (Swiper)
- 좋아요(하트) 기능

### 3. 📝 게시물 상세 모달
- 게시물 클릭 시 모달 형태로 상세 보기
- 댓글 출력 및 작성 기능
- 모달 외부 클릭 시 닫기 / 스크롤 방지 처리

### 4. 👤 유저 프로필 페이지
- 유저의 피드 목록 출력 (Hover 시 좋아요/댓글 수 표시)
- 팔로워 / 팔로우 수 및 목록 확인
- 프로필 수정 (닉네임, 소개글, 프로필 사진 등)

### 5. ➕ 게시물 업로드
- 클릭 또는 드래그 앤 드롭으로 이미지 업로드
- 이미지 미리보기 및 개별 삭제 기능
- 다중 이미지 등록 지원

### 6. 💬 DM(Direct Message) 기능
- 1:1 채팅방 생성 및 메시지 실시간 전송 (WebSocket)
- 실시간 알림 및 읽음 처리
- DM 사이드바에서 채팅방 목록 확인

### 7. 🔔 알림 시스템
- 좋아요 / 댓글 / 팔로우 / DM 수신 알림
- 실시간 알림 수신 및 알림창 출력
- 알림 읽음 처리 기능 포함

---

## 📸 주요 화면 캡처

> (여기에 이미지 첨부할 예정이라면  
> `/public/readme-assets/...` 또는 이미지 주소 사용)

---

## 🔒 보안 및 인증 처리
- 비밀번호 해싱 처리 (bcrypt)
- 토큰 기반 인증 (JWT)
- 로그인 유저만 접근 가능한 페이지 보호 처리

---

## 📁 프로젝트 구조 (예시)

