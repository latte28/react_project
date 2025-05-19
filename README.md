# React & Express 기반 SNS

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



### 3. 🏠 메인 피드 페이지
![image](https://github.com/user-attachments/assets/3cfb4619-f454-4182-8184-6de4b7c20349)

구현 기능
  - 게시물 리스트를 최신순으로 출력 (영상/이미지 지원)
  - 게시물별 좋아요, 댓글, 작성자 정보 출력
  - 사이드바에서 유저 추천 및 내 정보 확인 가능
  - 상단 스토리 목록은 하드코딩으로 구성된 더미 데이터 사용
  - 다크 모드 기반 레이아웃 구성

### 사이드 기능
  - 좌측 사이드바 하단 `더 보기` 클릭 시
  - 밝은/다크 모드 전환 기능 제공
  - 로그아웃 기능 제공 (로컬스토리지 초기화 + 로그인 페이지 이동)

### 4. 📝 게시물 상세 모달
![image](https://github.com/user-attachments/assets/fb434679-f153-4825-bf3f-e00e444050ba)

구현 기능
- 게시물 클릭 시 모달 형태로 상세 정보 표시
- 작성자, 날짜, 본문 내용, 좋아요 수, 댓글 목록 출력
- 댓글 작성 및 답글 기능 제공 (1단계 대댓글 포함)
- **@멘션 기능** 지원으로 유저 강조
- 메인 피드 댓글 아이콘 클릭 또는 프로필 페이지 게시물 클릭 시 진입 가능
- ESC 키 또는 닫기 버튼 클릭 시 모달 종료

### 기술 포인트
- React Portal을 사용한 모달 구현
- 댓글, 좋아요 상태 실시간 반영
- 정규표현식을 활용한 @멘션 탐지 및 하이라이팅 처리

### 5. ➕ 게시물 업로드
![image](https://github.com/user-attachments/assets/24681d22-9b38-405c-80ed-8c4ad73ca990)

### 구현 기능
- 사이드바 `업로드` 버튼 클릭 시 업로드 모달 열림
- 이미지 또는 영상 파일 선택 가능 (다중 업로드 지원)
- 업로드한 파일에 대한 미리보기 제공
- 게시글 내용 작성 후 `업로드` 버튼 클릭 시 서버로 전송 및 저장
- 업로드 취소 시 모달 닫힘 처리

### 기술 포인트
- FormData를 활용한 파일 전송 처리
- 미디어 파일은 Multer를 통해 서버에 저장
- 업로드 성공 시 피드 목록 자동 갱신

### 4. 👤 유저 프로필 페이지
![image](https://github.com/user-attachments/assets/15b72ff2-9a62-4714-8554-feae3ca4314e)

### 구현 기능
- 유저 정보(프로필 사진, 닉네임, 소개글) 출력
- 게시물 수, 팔로워 수, 팔로우 수 표시
- 자신의 프로필인 경우 `프로필 편집` 버튼 표시
- 작성한 피드 목록을 썸네일 형태로 출력
- 썸네일 클릭 시 게시물 상세 모달 열림

## 5. 👤 프로필 편집
![image](https://github.com/user-attachments/assets/2ecca09f-1464-4c32-b2da-67d733b4cb5d)

### 구현 기능
- 프로필 사진, 이름, 닉네임, 소개글, 성별 수정 가능
- 기존 정보는 자동으로 입력된 상태로 표시
- 프로필 사진 클릭 시 새로운 이미지 업로드 가능
- 수정 후 '수정 완료' 클릭 시 DB 업데이트 및 UI 반영
- '취소' 클릭 시 변경 내용 무시하고 모달 종료

### 기술 포인트
- FormData를 통한 이미지 포함 전송
- 수정 시 JWT 기반 사용자 인증 필요
- 실시간 미리보기 및 기본 유효성 검사 적용


### 6. 💬 DM(Direct Message) 기능
![image](https://github.com/user-attachments/assets/fa9dc823-cca6-49ae-ada2-422b249edaeb)

### 구현 기능
- 좌측에는 내가 참여한 DM 목록이 리스트 형태로 표시됨
- 우측에는 메시지 시작 안내 및 `메시지 보내기` 버튼 제공
- 메시지 보내기 클릭 시 사용자 목록에서 대화 상대 선택 가능
- 상대를 선택하면 실시간 채팅 화면으로 전환됨
- 나간 채팅방은 목록에서 자동 제외

### 기술 포인트
- WebSocket 기반 1:1 실시간 채팅 구현
- 채팅방은 사용자 간 유일하게 구성 (중복 생성 방지)
- 메시지 전송/수신 시 실시간 알림 및 자동 스크롤 적용

### 7. 🔔 알림 시스템
![image](https://github.com/user-attachments/assets/d758657e-3abe-4580-afac-75009407881c)

### 구현 기능
- 사이드바의 알림 아이콘 클릭 시 슬라이드 패널로 알림 표시
- 좋아요, 댓글, 팔로우 등의 활동에 대한 실시간 알림 수신
- 읽지 않은 알림은 빨간 배지로 개수 표시
- 알림 항목 클릭 시 관련 게시물 위치로 자동 스크롤 이동

### 기술 포인트
- WebSocket을 통한 실시간 알림 수신 구현
- 알림 데이터는 서버 DB에 저장되어 재접속 시에도 유지
- 클릭한 알림은 자동으로 읽음 처리
- 알림 패널은 닫기 버튼 또는 외부 클릭 시 닫힘 처리

---

## 📁 프로젝트 후기
처음으로 SNS 기능을 직접 구현해보면서 로그인, 실시간 알림, 채팅, 프로필 편집 등 생각보다 어려운 부분이 많았지만 하나씩 해결해가며 완성했을 때 큰 성취감을 느꼈습니다.
제한된 시간 속에서도 주요 기능을 실제 서비스처럼 구현해내기엔 시간이 부족했었고 추후 시간이 된다면 부족했던 부분들을 마무리하고 구현하지 못했던 기능을 추가해보고 싶습니다.  

