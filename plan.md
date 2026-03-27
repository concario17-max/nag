# 작업 계획

## 목표
desktop에서 `CODEX I` 제목이 sidebar 상단에 확실히 보이도록 하고, chapter tree는 계속 `1.index.txt` 기반 그룹 구조를 유지한다.

## 완료된 작업
- [x] 현재 title render 경로 확인
  - `LeftSidebar`가 codex 제목을 계산하고 있는지 확인했다.
  - `SidebarLayout`이 desktop title strip을 렌더할 수 있는지 확인했다.
- [x] desktop title source 연결
  - `LeftSidebar`가 `sidebarGroups[0]?.title ?? 'Codex I'`를 `SidebarLayout title`로 넘기게 정리했다.
  - `SidebarHeader`는 mobile-only로 유지했다.
- [x] empty work 유지
  - `1.index.txt`에만 있는 work가 chapter tree에서 사라지지 않도록 그룹 구조를 유지했다.
- [x] mobile close control 단일화
  - sidebar shell의 mobile close와 `SidebarHeader`가 중복되지 않도록 정리했다.
- [x] 브라우저/빌드 검증
  - `npm.cmd run build` 통과
  - `node tests/run-tests.js` 통과
  - 브라우저 캡처에서 desktop `CODEX I` title strip 노출 확인

## 구현 메모
- parser/data 파일은 건드리지 않았다.
- title은 sidebar 데이터에서 계산한 codex title을 source of truth로 쓴다.
- desktop에서는 `SidebarLayout`의 title strip, mobile에서는 `SidebarHeader`가 보여야 한다.

## 최종 상태
- 이 계획은 모두 완료 상태다.
