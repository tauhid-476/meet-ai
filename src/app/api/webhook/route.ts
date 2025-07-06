import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
    MessageNewEvent,
    CallEndedEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";
import { generateAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { GoogleGenerativeAI } from "@google/generative-ai";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


//verifying who is trying to access the webhook
//its protected via signature verification
const verifySignature = (body: string, signature: string): boolean => {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature")
    const apiKey = req.headers.get("x-api-key")
    console.log("Received webhook request with signature:", signature, "and API key:", apiKey);

    if (!signature || !apiKey) {
        return NextResponse.json(
            { error: "Missing signature or API key" },
            { status: 400 }
        )
    }

    const body = await req.text();
    console.log("Request body:", body);
    if (!verifySignature(body, signature)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        )
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>)?.type;
    console.log("Event type received:", eventType);
    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        console.log("Call session started event received:", event);
        const meetingId = event.call.custom?.meetingId;

        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId in call session started event" }, { status: 400 });
        }

        //get the meeting with upcoming status and update it to active
        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    not(eq(meetings.status, "completed")),
                    not(eq(meetings.status, "active")),
                    not(eq(meetings.status, "cancelled")),
                    not(eq(meetings.status, "processing"))
                )
            )

        if (!existingMeeting) {
            return NextResponse.json(
                { error: "Meeting not found or already completed" },
                { status: 404 }
            );
        }

        await db
            .update(meetings)
            .set({ status: "active", startedAt: new Date() })
            .where(eq(meetings.id, existingMeeting.id));

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        //connect the agent to the call
        const call = streamVideo.video.call("default", existingMeeting.id)
        console.log("Call object created:", call);
        const realTimeClient = await streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: existingAgent.id
        })
        console.log("Connected to call with OpenAI", realTimeClient);

        realTimeClient.updateSession({
            instructions: existingAgent.instructions
        });

    } else if (eventType === "call.session_participant_left") {
        //session participant event
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];
        //call_cid is in the format "type:id"
        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId in participant left event" }, { status: 400 });
        }

        const call = streamVideo.video.call("default", meetingId)
        await call.end()

    } else if (eventType === "call.session_ended") {
        //call ended event
        const event = payload as CallEndedEvent;
        const meetingId = event.call.custom?.meetingId;
        if (!meetingId) {
            return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
        }

        await db
            .update(meetings)
            .set({
                status: "processing",
                endedAt: new Date()
            })
            .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")))
    } else if (eventType === "call.transcription_ready") {
        //transcript ready event
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        const [updatedMeeting] = await db
            .update(meetings)
            .set({
                transcriptUrl: event.call_transcription.url
            })
            .where(eq(meetings.id, meetingId))
            .returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl
            }
        })

    } else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        await db
            .update(meetings)
            .set({
                recordingUrl: event.call_recording.url
            })
            .where(eq(meetings.id, meetingId))
    } else if (eventType === "message.new") {

        const event = payload as MessageNewEvent;
        const userId = event?.user?.id
        const text = event.message?.text;
        const channelId = event.channel_id

        if (!userId || !text || !channelId) {
            return NextResponse.json({ error: "Missing userId, text or channelId in message event" }, { status: 400 });
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting not found or not completed" }, { status: 404 });
        }

        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, existingMeeting.agentId));

        if (!existingAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        if (userId !== existingAgent.id) {
            const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:
      
      ${existingMeeting.summary}
      
      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
      
      ${existingAgent.instructions}
      
      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.
      
      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
      
      If the summary does not contain enough information to answer a question, politely let the user know.
      
      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;
            const channel = streamChat.channel("messaging", channelId)
            await channel.watch();

            const previousMessages = channel.state.messages
                .slice(-5)
                .filter((msg) => msg.text && msg.text.trim() !== "")
                .map((message) => ({
                    role: message.user?.id === existingAgent.id ? "assistant" : "user",
                    content: message.text || ""
                }))

            const geminiHistory = previousMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                // Gemini uses 'model' for the assistant's role
                parts: [{ text: msg.content }],
            }));
            const chat = model.startChat({
                history: geminiHistory,
                systemInstruction: {
                    role: "system",
                    parts: [{ text: instructions }]
                    // Using the 'instructions' variable you already built
                },
            });

            const result = await chat.sendMessage(text);
            const GEMINIResponse = result.response;
            const responseText = GEMINIResponse.text();

            if(!responseText) {
                return NextResponse.json({ error: "No response from Gemini" }, { status: 500 });
            }

            const avatarUrl = generateAvatarUri({seed: existingAgent.name, variant:"botttsNeutral"});

            streamChat.upsertUser({
                id: existingAgent.id,
                name: existingAgent.name,
                image: avatarUrl
            })

            channel.sendMessage({
                text: responseText,
                user: {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    image: avatarUrl
                }
            })
        }
    }

    return NextResponse.json({ status: "ok" })

}