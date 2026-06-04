// AI Engineer — D6 Voice & Multimodal AI — Level 4 (single lesson)

export const D6_L4_LESSON = {
  slug: "voice-ai-at-scale",
  title: "Voice AI at scale",
  description:
    "Ship a sub-500ms voice agent: OpenAI Realtime API, LiveKit Agents SDK, WebRTC transport, and the latency budget that actually holds in production.",
  dimension: "voice_multimodal",
  difficulty: "advanced",
  estimatedMinutes: 22,
  order: 4,
  content: `## Why It Matters
By L3 you have a working voice pipeline: STT, LLM, TTS, plus barge-in. That demo works on your laptop with one user on a clean network. Production is a different problem. Your agent now competes with phone calls — users will hang up if the first audio byte takes longer than half a second, and any glitch in the audio stream feels like the bot is "broken" even when the model output is perfect.

This lesson covers what changes when you put a voice agent in front of real users on real networks: the transport (WebRTC, not WebSockets-over-TCP), the runtime (OpenAI Realtime API or LiveKit Agents SDK), and the latency budget that decides whether your agent feels human or feels like a 2010 IVR.

## WebRTC Basics: Why Voice Needs It
Plain HTTP and even WebSockets run over TCP. TCP guarantees in-order delivery — which means if one packet is lost, every later packet waits for the retransmit. For text that is fine. For 20ms audio frames it is a disaster: a single dropped packet can stall playback for hundreds of milliseconds and the user hears a freeze.

WebRTC uses UDP with its own application-layer recovery (SRTP for media, RTCP for control). Lost packets are concealed by the codec rather than retransmitted, so a brief loss sounds like a tiny artifact instead of a stall. WebRTC also brings three things you cannot easily build yourself:

- **Opus codec** — variable bitrate (6–510 kbps), tuned for voice down to 6kbps, music up to 510kbps. Encodes a 20ms frame in under 1ms. Every browser and every serious voice provider speaks Opus.
- **Jitter buffer** — a small adaptive queue (usually 40–120ms) that smooths out packets arriving out of order or bunched together. Without it, every network hiccup is audible.
- **ICE / STUN / TURN** — NAT traversal so the call connects through corporate firewalls and mobile carriers without you running your own proxy.

If you are tempted to "just use WebSockets" for audio in production: don't. You will reimplement half of WebRTC badly.

## OpenAI Realtime API
Realtime is OpenAI's WebSocket (or WebRTC) endpoint that does STT, LLM reasoning, and TTS in one bidirectional stream. You send audio frames, the server streams audio back, and turn detection (server-side VAD) is handled for you.

\`\`\`python
import asyncio, base64, json, websockets

async def run():
    url = "wss://api.openai.com/v1/realtime?model=gpt-realtime"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    async with websockets.connect(url, additional_headers=headers) as ws:
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "voice": "alloy",
                "turn_detection": {"type": "server_vad", "threshold": 0.5},
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
            },
        }))
        async for raw in ws:
            event = json.loads(raw)
            if event["type"] == "response.audio.delta":
                audio = base64.b64decode(event["delta"])
                speaker.write(audio)  # 24kHz mono PCM
            elif event["type"] == "response.done":
                print("turn complete")

        # send mic audio in 20ms PCM16 frames
        # await ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": b64_frame}))

asyncio.run(run())
\`\`\`

Realtime is the fastest path to a working agent, but you give up control over the speech-to-text and text-to-speech stages. If you need a custom voice, a specialist STT for an accent, or on-prem deployment, you need LiveKit.

## LiveKit Agents SDK
LiveKit Agents lets you wire your own pipeline — VAD, STT provider, LLM, TTS provider — and run it as a participant inside a WebRTC room. The SDK handles the transport, the turn-taking, and the barge-in interruption logic.

\`\`\`python
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, deepgram, silero

class Assistant(Agent):
    def __init__(self):
        super().__init__(instructions="You are a concise voice assistant.")

async def entrypoint(ctx: JobContext):
    await ctx.connect()
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="en"),
        llm=openai.LLM(model="gpt-4.1-mini"),
        tts=openai.TTS(voice="alloy"),
    )
    await session.start(agent=Assistant(), room=ctx.room)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
\`\`\`

Silero VAD detects speech boundaries locally so you only stream to the STT when the user is actually talking. Deepgram returns partial transcripts every ~100ms. The LLM starts generating as soon as the user pauses, and TTS streams the first chunk while the model is still finishing the sentence.

## Production Latency Tuning
The number that matters is first-byte-out: from the moment the user finishes speaking to the moment they hear the first frame of the reply. Target sub-500ms. Anything above 800ms feels like dial-up.

A realistic budget on a healthy network:

- **Network in:** ~30ms (mic to server, WebRTC over UDP)
- **VAD turn-end detection:** ~50ms (Silero with a tight end-of-utterance window)
- **STT final transcript:** ~100ms (streaming, so most of this overlaps the user speaking)
- **LLM TTFT (time-to-first-token):** ~200ms (small model, prompt cached, no tool call)
- **TTS first audio chunk:** ~100ms (streaming synthesis)
- **Network out:** ~30ms

That sums to roughly 510ms — and the only way to stay under 500ms in practice is to overlap the stages: start TTS on the first LLM token, not the last; start LLM generation on STT partials, not finals, when you can rollback safely.

If you are above 800ms, the culprit is almost always one of three things: a large LLM (Sonnet vs Haiku doubles TTFT), uncached prompts (cold cache adds 200–500ms), or running compute in the wrong region.

## Scale Considerations
- **Region pinning.** Put the agent worker in the same region as the LLM endpoint and the LiveKit SFU. A New York user routed through a Frankfurt worker eats 150ms RTT for free.
- **Codec.** Always Opus, 16kHz minimum for voice. Do not transcode through MP3 or G.711 unless you are bridging to PSTN.
- **Jitter buffer.** Trust the WebRTC stack's adaptive buffer; do not "fix" stutter by hard-coding a larger buffer — you will trade glitches for sluggishness.
- **Concurrency.** One agent worker per call is fine up to ~50 concurrent sessions on a modest box if your STT and TTS are remote. Autoscale on active-session count, not CPU.
- **Observability.** Log first-byte latency per turn, not per session. A session-level p50 will hide the bad turns.

## Key Takeaways
- WebRTC + Opus + jitter buffer is the production transport — WebSockets-over-TCP is for prototypes.
- OpenAI Realtime API is the fastest path; LiveKit Agents SDK is the most flexible.
- Sub-500ms first-byte is the target; you only hit it by overlapping VAD, STT, LLM, and TTS, not by serializing them.
- Server-side VAD plus barge-in is non-negotiable for natural turn-taking.
- Pin regions, log per-turn, autoscale on sessions.`,
  quizzes: [
    {
      question:
        "Your voice agent feels great on the dev box but users on flaky mobile networks complain of frequent multi-second freezes in the audio. You currently stream PCM audio over a WebSocket. What is the most likely root cause?",
      choices: [
        {
          id: "a",
          label:
            "The LLM is too slow; switch to a smaller model to fix the freezes",
          correct: false,
        },
        {
          id: "b",
          label:
            "WebSockets run over TCP, so a single lost packet stalls every later packet until retransmit; voice needs WebRTC (UDP + Opus + jitter buffer) so loss is concealed instead of stalling",
          correct: true,
        },
        {
          id: "c",
          label:
            "The TTS voice is too high-quality; downgrade to a lower bitrate to fix the freezes",
          correct: false,
        },
        {
          id: "d",
          label:
            "The microphone is sampling at 16kHz instead of 8kHz, causing buffer overruns on mobile",
          correct: false,
        },
      ],
      order: 1,
    },
    {
      question:
        "You measure first-byte-out at 950ms and the user perceives the agent as sluggish. You are running Claude Sonnet through a US-East worker, with the LiveKit SFU in EU-West and no prompt caching. Which single change is most likely to bring you under the sub-500ms target?",
      choices: [
        {
          id: "a",
          label:
            "Increase the jitter buffer from 60ms to 200ms so audio plays more smoothly",
          correct: false,
        },
        {
          id: "b",
          label:
            "Switch from Opus to G.711 to reduce decode time on the client",
          correct: false,
        },
        {
          id: "c",
          label:
            "Co-locate the worker, the SFU, and the LLM endpoint in one region and enable prompt caching; cross-region RTT plus cold cache is eating 400–700ms by itself",
          correct: true,
        },
        {
          id: "d",
          label:
            "Disable server-side VAD and rely on a fixed 1-second silence timeout for turn-end",
          correct: false,
        },
      ],
      order: 2,
    },
    {
      question:
        "Your team wants a custom voice clone and on-prem STT for a regulated customer. You currently use the OpenAI Realtime API end-to-end. What is the right move?",
      choices: [
        {
          id: "a",
          label:
            "Stay on OpenAI Realtime and ask OpenAI to host the custom voice and on-prem STT inside Realtime",
          correct: false,
        },
        {
          id: "b",
          label:
            "Drop voice features for that customer; production voice agents cannot be customized",
          correct: false,
        },
        {
          id: "c",
          label:
            "Move to the LiveKit Agents SDK so you can wire your own VAD, on-prem STT, LLM, and custom-voice TTS into a WebRTC pipeline you control end-to-end",
          correct: true,
        },
        {
          id: "d",
          label:
            "Replace WebRTC with a raw WebSocket so the audio never leaves your VPC",
          correct: false,
        },
      ],
      order: 3,
    },
  ],
} as const;
