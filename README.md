# 🐾 Dogstagram - React & Express 기반 SNS

![image](https://github.com/user-attachments/assets/c70c265c-62ef-4700-b115-51382c5c3978)

## 💡 프로젝트 소개
React, Express, MySQL을 활용하여 개발한 **인스타그램 스타일의 SNS 웹 애플리케이션**입니다.

⏱ **개발 목표**  
- 제한된 시간 내에 핵심 기능 위주로 구현  
- 완성도 높은 기능 구현을 우선으로 설계  

🎨 **UI/UX 구성**  
- 실제 인스타그램의 레이아웃을 참고  
- 사용자 친화적인 화면 구성 및 기능 배치

---

## 🗓 개발 기간
- 📅 **기간**: 2025.05.07 ~ 2025.05.16  
- 🛠 **내용**: 프로젝트 기획 구상, DB설계, 서비스 개발, 테스트 및 수정
---

## 🧑‍🤝‍🧑 팀원 구성

| 이름     | GitHub 프로필                          |
|----------|----------------------------------------|
| 박재원   | (https://github.com/latte28) |

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

### 1. 🔐 로그인 & 아이디 찾기 & 비밀번호 재설정

![스크린샷 2025-05-19 122759](https://github.com/user-attachments/assets/ee85d707-6a22-477e-b130-05d9797cad46)

구현 기능
- **로그인**
  - 아이디와 비밀번호 입력 시 DB 정보와 비교하여 로그인 처리
  - 입력값이 일치하지 않을 경우 에러 문구 출력 (ex. "존재하지 않는 아이디입니다.")
    
- **비밀번호 해시화**
  - 사용자 비밀번호는 bcrypt로 해시 처리하여 DB에 저장
  - 로그인 시 입력값을 해시하여 DB 값과 비교
  - 평문 저장 없이 안전하게 인증 처리
    
- **아이디 찾기**
  - 가입 시 사용한 이메일을 입력하면 일치하는 아이디를 찾아 반환
  - 존재하지 않는 경우 "일치하는 아이디가 없습니다" 등의 피드백 제공

- **비밀번호 재설정**
  - 아이디와 가입 이메일을 입력하면 비밀번호 재설정 링크를 메일로 전송
  - 사용자는 이메일 링크를 통해 새로운 비밀번호를 설정 가능
  - JWT 기반 토큰 인증을 통해 보안 처리

### 2. 🔐 회원가입 (실시간 유효성 검사 포함)
![스크린샷 2025-05-19 123829](https://github.com/user-attachments/assets/fd586004-4c00-48a2-9c20-08c628ba36ba)

구현 기능
  - 아이디 입력 시 실시간 중복 확인 및 사용 가능 여부 출력
  - 비밀번호는 영문 + 숫자 포함 8자 이상 조건 검사
  - 이메일, 전화번호, 생년월일 등 입력값 실시간 유효성 체크
  - 입력 오류 시 helperText와 시각적 피드백 제공



### 2. 🏠 메인 피드 페이지
![image](https://github.com/user-attachments/assets/3cfb4619-f454-4182-8184-6de4b7c20349)

구현 기능
  - 게시물 리스트를 최신순으로 출력 (영상/이미지 지원)
  - 게시물별 좋아요, 댓글, 작성자 정보 출력
  - 사이드바에서 유저 추천 및 내 정보 확인 가능
  - 상단 스토리 목록은 하드코딩으로 구성된 더미 데이터 사용
  - 다크 모드 기반 레이아웃 구성

사이드 기능
  - 좌측 사이드바 하단 `더 보기` 클릭 시
  - 밝은/다크 모드 전환 기능 제공
  - 로그아웃 기능 제공 (로컬스토리지 초기화 + 로그인 페이지 이동)

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

