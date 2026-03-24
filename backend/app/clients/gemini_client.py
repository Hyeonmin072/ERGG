"""
Google Gemini API 클라이언트.
나쟈의 독설, 메타 브리핑, 루트 컨설턴트 프롬프트를 처리한다.
"""
from __future__ import annotations
import google.generativeai as genai
from ..core.config import settings

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel(settings.gemini_model)


async def generate(prompt: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
    """Gemini로 텍스트 생성 (동기 SDK를 asyncio에서 호출)."""
    import asyncio
    loop = asyncio.get_event_loop()

    def _call():
        response = _model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return response.text

    return await loop.run_in_executor(None, _call)


# ──────────────────────────────────────────────────────────────────────────────
# 프롬프트 빌더
# ──────────────────────────────────────────────────────────────────────────────

def build_coach_prompt(nickname: str, stats: dict) -> str:
    return f"""당신은 이터널리턴의 냉혹한 AI 코치 나쟈입니다.
아래 플레이어의 최근 {stats.get('game_count', 20)}게임 데이터를 분석하고 독설 스타일로 피드백을 작성하세요.
감정 없이 데이터만 보고 판단하세요.

플레이어: {nickname}
평균 순위: {stats.get('avg_rank', 0):.1f}위 (전체 24명 중)
평균 딜량: {stats.get('avg_damage', 0):,.0f}
평균 몬스터킬: {stats.get('avg_monster_kill', 0):.1f}
킬 참여율: {stats.get('kill_participation', 0):.1f}%
시야 설치 (평균): {stats.get('avg_cameras', 0):.1f}개
생존 시간 (평균): {stats.get('avg_survivable_time', 0):.0f}초
가장 취약한 지표: {stats.get('weakest_axis', '알 수 없음')}
최근 주요 사망 원인: {stats.get('top_cause_of_death', '알 수 없음')}

반드시 구체적인 수치를 언급하고, 개선 방향을 3가지 제시하세요. 300자 이내. 한국어로 작성하세요."""


def build_meta_prompt(date: str, top_picks: list, top_win_rates: list) -> str:
    picks_str = ", ".join(f"{c['name']}({c['pick_rate']:.1f}%)" for c in top_picks[:5])
    wins_str = ", ".join(f"{c['name']}({c['win_rate']:.1f}%)" for c in top_win_rates[:5])
    return f"""이터널리턴 아시아 서버 {date} 날짜의 메타를 요약해주세요.

상위 픽률 캐릭터: {picks_str}
상위 승률 캐릭터: {wins_str}

간결한 메타 요약을 한국어로 200자 이내로 작성하세요. 주목할 트렌드와 추천 픽을 포함하세요."""


def build_route_prompt(character_name: str, character_num: int, style: str, weapon: str) -> str:
    return f"""이터널리턴 루트 추천 AI입니다.
아래 조건에 맞는 시작 루트와 전술 스킬을 추천해주세요.

캐릭터: {character_name} (번호: {character_num})
플레이 스타일: {style}
선호 무기: {weapon if weapon else '무관'}

routeIdOfStart 추천, 시작 지역명, 우선순위 아이템 3개, 전술 스킬 그룹 번호와 이유를 포함해 한국어로 답변하세요."""
