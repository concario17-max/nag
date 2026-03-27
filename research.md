# Research Report

## 요약
현재 `CODEX I`가 sidebar 상단에서 보이지 않는 이유는, 실제로는 상단바에 가려진 게 아니라 **desktop 경로에서 제목이 렌더되지 않기 때문**이다.

핵심 원인은 두 가지다.

1. `LeftSidebar`가 `Codex I` 타이틀을 `SidebarHeader`로 넘기지만, 그 컴포넌트는 `xl:hidden`이라 desktop에서는 아예 안 나온다.
2. `SidebarLayout`이 bori처럼 desktop용 title strip을 렌더하지 않기 때문에, sidebar 상단에 제목을 대신 표시할 장소가 없다.

즉, 화면상 증상은 “가려짐”처럼 보이지만 구조적으로는 **desktop title chrome 부재**가 맞다.

---

## 현재 구조

### 앱 프레임
- [`src/components/ui/AppShell.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/ui/AppShell.jsx)
  - 전체 앱을 `header / sidebar / main / rightPanel`로 배치한다.
  - `header`는 고정 상단바이고, 아래 영역은 좌우 패널과 본문으로 나뉜다.
- [`src/components/Header.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/Header.jsx)
  - 상단바는 `fixed top-0 h-16`으로 고정된다.
  - desktop header도 같은 높이 규칙을 공유한다.
- [`src/components/ui/desktopFrame.js`](/C:/Users/roadsea/Desktop/nag/src/components/ui/desktopFrame.js)
  - desktop에서 sidebar/main/rightPanel의 grid column을 제어한다.

### Sidebar shell
- [`src/components/ui/SidebarLayout.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/ui/SidebarLayout.jsx)
  - sidebar 공용 shell이다.
  - 현재는 `title` prop을 중심으로 한 desktop title strip을 렌더하지 않는다.
  - 모바일에서만 `showMobileClose`에 따라 닫기 버튼을 따로 보여준다.
- [`src/components/Sidebar/SidebarHeader.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/Sidebar/SidebarHeader.jsx)
  - 현재는 `xl:hidden`이다.
  - 즉 desktop viewport에서는 DOM에 있어도 시각적으로 숨겨진다.

### LeftSidebar 데이터 흐름
- [`src/pages/components/LeftSidebar.jsx`](/C:/Users/roadsea/Desktop/nag/src/pages/components/LeftSidebar.jsx)
  - `chapters`를 `codexId` / `codexTitle` 기준으로 다시 그룹화한다.
  - `sidebarGroups[0]?.title`는 보통 `Codex I`가 된다.
  - 그 값을 `SidebarHeader`에 넘긴다.
  - 문제는 그 header가 desktop에서 숨겨진다는 점이다.

---

## 왜 `CODEX I`가 안 보이는가

### 1) 제목은 실제로 계산된다
`LeftSidebar`는 다음 로직으로 상위 그룹 제목을 만들고 있다.

- `chapter.codexId`를 기준으로 그룹을 만든다.
- 첫 그룹의 `title`은 `Codex I`가 된다.
- 그 값을 `SidebarHeader`에 전달한다.

즉 데이터상으로는 title이 존재한다.  
문제는 title 값이 없는 게 아니라 **보여주는 자리가 없다는 것**이다.

### 2) `SidebarHeader`가 desktop에서 사라진다
[`src/components/Sidebar/SidebarHeader.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/Sidebar/SidebarHeader.jsx)에는 `xl:hidden`이 들어가 있다.

이 뜻은:

- 모바일에서는 title row가 보인다.
- desktop에서는 같은 컴포넌트가 렌더되어도 화면에 표시되지 않는다.

그래서 sidebar 상단에 `CODEX I`를 기대해도 desktop에서는 절대 안 나온다.

### 3) `SidebarLayout`이 desktop title chrome을 맡지 않는다
bori 쪽 구조는 `SidebarLayout` 또는 그 상위 shell이 desktop title strip을 따로 가지는 쪽에 가깝다.

지금 nag는:

- `SidebarLayout`이 단순 shell 역할만 한다.
- title prop을 desktop에서 그려주는 전용 영역이 없다.
- 그래서 `SidebarHeader`가 숨겨지면 title은 완전히 사라진다.

### 4) 상단바와 sidebar의 위치 관계는 별개다
[`src/components/Header.jsx`](/C:/Users/roadsea/Desktop/nag/src/components/Header.jsx)는 `fixed top-0 h-16`이고, sidebar shell은 `top-16` 기준으로 시작한다.

이 배치는:

- 상단바와 sidebar가 물리적으로 겹쳐서 title을 가리는 구조는 아니다.
- sidebar는 그냥 header 아래에서 시작한다.

즉, 이번 문제는 z-index 충돌보다 **초기 렌더 위치에 title strip이 없다는 문제**에 가깝다.

---

## 실제 사용자 화면과 코드의 대응

사용자가 본 화면에서는 왼쪽 sidebar 상단에서 바로 chapter list가 시작된다.

그 이유는:

- desktop에서 `SidebarHeader`가 숨겨짐
- `SidebarLayout`에 desktop title row 없음
- `LeftSidebar`는 chapter list를 바로 이어서 렌더함

그래서 시각적으로는 “상단바에 가려졌다”처럼 보이지만, 정확한 원인은 **title이 렌더되지 않고 chapter list만 노출되는 구조**다.

---

## 데이터 파이프라인 참고

이번 title 문제와 별개로, chapter tree 자체는 이미 `1.index.txt` 기반으로 구성되어 있다.

- [`src/lib/parseCodex.js`](/C:/Users/roadsea/Desktop/nag/src/lib/parseCodex.js)
  - `codexIndex`와 `codexData.works`를 병합해서 읽기 데이터를 만든다.
- [`src/lib/parseCodexCore.js`](/C:/Users/roadsea/Desktop/nag/src/lib/parseCodexCore.js)
  - `mergeCodexIndexWithWorks()`가 empty work도 목록에 남기도록 만든다.
  - `flattenParagraphs()`는 중첩 트리에서도 실제 paragraph만 뽑는다.
- [`src/pages/TextPage.jsx`](/C:/Users/roadsea/Desktop/nag/src/pages/TextPage.jsx)
  - `buildReadingData()` 결과를 sidebar와 본문에 넘긴다.

즉, chapter tree의 데이터 계약은 이미 정리되어 있고, 지금 문제는 **데이터가 아니라 shell chrome**이다.

---

## 결론

`CODEX I`가 상단바에 가려진 게 아니라, desktop에서 보여줄 title 영역이 빠져 있어서 안 보이는 것이다.

정리하면:

- title 값은 존재한다.
- `SidebarHeader`는 desktop에서 숨겨진다.
- `SidebarLayout`은 desktop title strip을 그리지 않는다.
- 그래서 sidebar 상단에는 chapter list만 남는다.

다음 구현 단계에서 고쳐야 할 방향은 분명하다.

- desktop에서만 보이는 title strip을 sidebar shell에 다시 넣는다.
- 모바일 title row와 desktop title row의 소스를 분리하거나, 하나의 공용 title slot으로 재구성한다.
- chapter list 시작점은 title strip 아래로 내려가게 유지한다.

지금 단계에서는 구현하지 않았고, 원인 분석만 마쳤다.
