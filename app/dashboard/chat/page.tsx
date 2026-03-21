"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useConversations, usePatientRecords, usePrescriptions, useLabResults } from "@/hooks/queries"
import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import {
    BubbleChatIcon,
    ArrowLeft01Icon,
    Sent02Icon,
    Tick02Icon,
    Search01Icon,
    AttachmentIcon,
    Cancel01Icon,

    MedicalMaskIcon,
    TestTubeIcon,
    FoldersIcon,
    File01Icon,

} from "hugeicons-react"
import { FolderIcon, Loader2, CheckCheck } from "lucide-react"
import { FileIcon } from "@radix-ui/react-icons"

interface Conversation {
    room_id: string
    other_user: {
        user_id: number
        name: string
        avatar_url?: string
        role: string
    }
    last_message: string
    last_message_time: string
    unread_count: number
    last_sender_id: number
}

interface ChatMsg {
    id?: number
    sender_id: number
    receiver_id: number
    message: string
    timestamp: string
    is_read: boolean
    type?: string
}

interface SharedRecord {
    type: "shared_record"
    category: "record" | "prescription" | "lab_result"
    id: number
    title: string
    document_type?: string
    document_url?: string
    date: string
    extra?: string
}

const BACKEND_WS = process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") || "ws://127.0.0.1:8000"

function getInitials(name?: string) {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function timeAgo(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function parseMessage(message: string): { isRecord: true; record: SharedRecord } | { isRecord: false } {
    if (message.startsWith("__RECORD__:")) {
        try {
            const record = JSON.parse(message.slice(11))
            return { isRecord: true, record }
        } catch { /* fall through */ }
    }
    return { isRecord: false }
}

function RecordCard({ record, isMine }: { record: SharedRecord; isMine: boolean }) {
    const categoryIcon = record.category === "prescription"
        ? <MedicalMaskIcon className="w-4 h-4 text-primary" />
        : record.category === "lab_result"
            ? <TestTubeIcon className="w-4 h-4 text-primary" />
            : <FoldersIcon className="w-4 h-4 text-primary" />

    const categoryLabel = record.category === "prescription" ? "Prescription"
        : record.category === "lab_result" ? "Lab Result"
            : record.document_type || "Medical Record"

    return (
        <div className={`max-w-[78%] rounded-3xl overflow-hidden shadow-sm border ${isMine ? "rounded-br-lg border-primary/30 bg-primary/5" : "rounded-bl-lg border-border bg-card"}`}>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-primary/5">
                {categoryIcon}
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide">{categoryLabel}</span>
            </div>
            <div className="px-4 py-3">
                <p className="font-semibold text-sm text-foreground">{record.title}</p>
                {record.extra && <p className="text-xs text-muted-foreground mt-0.5">{record.extra}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(record.date).toLocaleDateString()}</p>
                {record.document_url && (
                    <a
                        href={record.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                        <File01Icon className="w-3.5 h-3.5" /> View Document
                    </a>
                )}
            </div>
        </div>
    )
}

export default function ChatPage() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const targetUserId = searchParams.get('userId')
    const { data: conversations, isLoading: loadingConvos } = useConversations()
    const { data: patientRecords } = usePatientRecords()
    const { data: prescriptions } = usePrescriptions()
    const { data: labResults } = useLabResults()

    const [activeRoom, setActiveRoom] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<ChatMsg[]>([])
    const [inputText, setInputText] = useState("")
    const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
    const [search, setSearch] = useState("")
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [attachCategory, setAttachCategory] = useState<"record" | "prescription" | "lab_result" | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    const openRoom = useCallback(async (conv: Conversation) => {
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
        setMessages([])
        setActiveRoom(conv)
        setWsStatus("connecting")
        setShowAttachMenu(false)
        setAttachCategory(null)

        let token = document.cookie.split("; ").find(r => r.startsWith("access_token="))?.split("=")[1]
        if (!token) {
            try {
                const res = await fetch('/api/auth/token')
                if (res.ok) {
                    const data = await res.json()
                    token = data.token
                }
            } catch (e) { console.error("Could not fetch token for WS", e) }
        }
        
        if (!token) { setWsStatus("disconnected"); return }

        const ws = new WebSocket(`${BACKEND_WS}/chat/ws/${conv.room_id}?token=${token}`)
        wsRef.current = ws

        ws.onopen = () => setWsStatus("connected")
        ws.onclose = () => setWsStatus("disconnected")
        ws.onerror = () => setWsStatus("disconnected")

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === "history") {
                setMessages(data.messages)
                setTimeout(scrollToBottom, 100)
            } else if (data.type === "message") {
                setMessages(prev => [...prev, data])
                setTimeout(scrollToBottom, 50)
                queryClient.invalidateQueries({ queryKey: ['conversations'] })
                queryClient.invalidateQueries({ queryKey: ['unread-count'] })
            } else if (data.type === "read_receipt") {
                if (data.reader_id !== user?.id) {
                    setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
                }
            }
        }
        inputRef.current?.focus()
    }, [queryClient, scrollToBottom])

    const sendRaw = (message: string) => {
        if (!activeRoom || wsRef.current?.readyState !== WebSocket.OPEN || !user?.id) return
        wsRef.current.send(JSON.stringify({
            type: "message",
            receiver_id: activeRoom.other_user.user_id,
            message,
        }))
    }

    const sendMessage = () => {
        const text = inputText.trim()
        if (!text) return
        sendRaw(text)
        setInputText("")
    }

    const shareRecord = (record: SharedRecord) => {
        const payload = `__RECORD__:${JSON.stringify(record)}`
        sendRaw(payload)
        setShowAttachMenu(false)
        setAttachCategory(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "ping" }))
            }
        }, 25000)
        return () => { clearInterval(interval); wsRef.current?.close() }
    }, [])
    
    // Auto-open chat if userId is in URL
    useEffect(() => {
        if (!targetUserId || !user) return;
        
        const initChat = async () => {
            try {
                // Check if we already have it in the list
                const existing = conversations?.find((c: Conversation) => c.other_user.user_id.toString() === targetUserId)
                if (existing) {
                    openRoom(existing)
                    return
                }
                
                // Otherwise ask backend to start/get the room
                const res = await apiClient.post(`/chat/start/${targetUserId}`)
                const newRoom = res.data
                openRoom({
                    ...newRoom,
                    last_message: "",
                    last_message_time: new Date().toISOString(),
                    unread_count: 0,
                    last_sender_id: 0
                })
            } catch (err) {
                console.error("Failed to init chat:", err)
            }
        }
        
        initChat()
    }, [targetUserId, user, conversations, openRoom])

    const filteredConvos: Conversation[] = (conversations || []).filter((c: Conversation) =>
        c.other_user.name?.toLowerCase().includes(search.toLowerCase())
    )

    // ─── Attachment picker ───
    const AttachPicker = (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-3xl shadow-xl overflow-hidden z-20">
            {!attachCategory ? (
                <div className="p-2 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1">Share Medical Info</p>
                    {[
                        { id: "record" as const, label: "Medical Records", icon: FolderIcon, desc: "Uploaded documents" },
                        { id: "prescription" as const, label: "Prescriptions", icon: MedicalMaskIcon, desc: "Your prescriptions" },
                        { id: "lab_result" as const, label: "Lab Results", icon: TestTubeIcon, desc: "Test results" },
                    ].map(({ id, label, icon: Icon, desc }) => (
                        <button key={id} onClick={() => setAttachCategory(id)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-muted transition-all text-left">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-2">
                    <button onClick={() => setAttachCategory(null)}
                        className="flex items-center gap-1 text-xs text-primary font-semibold mb-2 px-2 hover:underline">
                        <ArrowLeft01Icon className="w-3.5 h-3.5" /> Back
                    </button>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                        {attachCategory === "record" && (patientRecords || []).map((r: any) => (
                            <button key={r.id} onClick={() => shareRecord({
                                type: "shared_record", category: "record",
                                id: r.id, title: r.title, document_type: r.document_type,
                                document_url: r.document_url, date: r.created_at, extra: r.description
                            })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-all">
                                <FolderIcon className="w-4 h-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                                    <p className="text-xs text-muted-foreground">{r.document_type}</p>
                                </div>
                            </button>
                        ))}
                        {attachCategory === "prescription" && (prescriptions || []).map((p: any) => (
                            <button key={p.id} onClick={() => shareRecord({
                                type: "shared_record", category: "prescription",
                                id: p.id, title: `Prescription #${p.prescription_code}`,
                                date: p.created_at, extra: p.notes
                            })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-all">
                                <MedicalMaskIcon className="w-4 h-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">Rx #{p.prescription_code}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                                </div>
                            </button>
                        ))}
                        {attachCategory === "lab_result" && (labResults || []).map((l: any) => (
                            <button key={l.id} onClick={() => shareRecord({
                                type: "shared_record", category: "lab_result",
                                id: l.id, title: l.test_name || "Lab Result",
                                document_url: l.result_file_url, date: l.created_at, extra: l.notes
                            })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-all">
                                <TestTubeIcon className="w-4 h-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{l.test_name || "Lab Result"}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{l.status}</p>
                                </div>
                            </button>
                        ))}
                        {(
                            (attachCategory === "record" && !patientRecords?.length) ||
                            (attachCategory === "prescription" && !prescriptions?.length) ||
                            (attachCategory === "lab_result" && !labResults?.length)
                        ) && (
                                <p className="text-sm text-muted-foreground text-center py-6">No items found</p>
                            )}
                    </div>
                </div>
            )}
        </div>
    )

    // ─── Conversation list ───
    const ConversationList = (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-5 pb-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
                <div className="relative mt-3">
                    <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search conversations…"
                        className="w-full h-10 pl-9 pr-4 text-sm rounded-2xl bg-muted border border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-24 lg:pb-4 space-y-0.5">
                {loadingConvos && <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                {!loadingConvos && filteredConvos.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <BubbleChatIcon className="w-14 h-14 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No conversations yet</p>
                        <p className="text-sm mt-1">Start a chat from a doctor or provider profile</p>
                    </div>
                )}
                {filteredConvos.map((conv: Conversation) => {
                    const isActive = activeRoom?.room_id === conv.room_id
                    const isMe = conv.last_sender_id === user?.id
                    const lastMsg = conv.last_message.startsWith("__RECORD__:") ? "📎 Shared a medical record" : conv.last_message
                    return (
                        <button key={conv.room_id} onClick={() => openRoom(conv)}
                            className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all text-left group ${isActive ? "bg-primary/10" : "hover:bg-muted"}`}>
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                    {conv.other_user.avatar_url
                                        ? <img src={conv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-primary font-bold text-sm">{getInitials(conv.other_user.name)}</span>}
                                </div>
                                {conv.unread_count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{conv.other_user.name}</p>
                                    <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{timeAgo(conv.last_message_time)}</span>
                                </div>
                                <p className={`text-xs truncate ${conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {isMe ? "You: " : ""}{lastMsg}
                                </p>
                                <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{conv.other_user.role}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )

    // ─── Chat room ───
    const ChatRoom = activeRoom && (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => setActiveRoom(null)} className="lg:hidden w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <ArrowLeft01Icon className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shrink-0">
                    {activeRoom.other_user.avatar_url
                        ? <img src={activeRoom.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="text-primary font-bold text-sm">{getInitials(activeRoom.other_user.name)}</span>}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{activeRoom.other_user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${wsStatus === "connected" ? "bg-green-500" : "bg-muted-foreground"}`} />
                        {wsStatus === "connected" ? "Online" : wsStatus === "connecting" ? "Connecting…" : "Offline"}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {wsStatus === "connecting" && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
                {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id
                    const parsed = parseMessage(msg.message)
                    const showTime = i === 0 || (new Date(msg.timestamp).getTime() - new Date(messages[i - 1]?.timestamp).getTime()) > 5 * 60 * 1000
                    return (
                        <div key={msg.id || i}>
                            {showTime && (
                                <div className="text-center my-2">
                                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {new Date(msg.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            )}
                            <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                {parsed.isRecord ? (
                                    <RecordCard record={parsed.record} isMine={isMine} />
                                ) : (
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-3xl text-sm leading-relaxed shadow-sm ${isMine ? "bg-primary text-white rounded-br-lg" : "bg-card border border-border text-foreground rounded-bl-lg"}`}>
                                        {msg.message}
                                        {isMine && (
                                            <div className="text-right mt-0.5">
                                                {msg.is_read ? (
                                                    <CheckCheck className="w-3.5 h-3.5 inline-block text-sky-200 opacity-90" />
                                                ) : (
                                                    <Tick02Icon className="w-3 h-3 inline-block opacity-70" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input bar with attachment */}
            <div className="px-4 py-3 border-t border-border bg-background/90 backdrop-blur sticky bottom-0">
                <div className="relative">
                    {showAttachMenu && AttachPicker}
                    <div className="flex items-center gap-2">
                        {/* Attachment button — only for patients */}
                        {user?.role?.toLowerCase() === "patient" && (
                            <button
                                onClick={() => { setShowAttachMenu(p => !p); setAttachCategory(null) }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${showAttachMenu ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                                title="Share a medical record"
                            >
                                {showAttachMenu ? <Cancel01Icon className="w-4 h-4" /> : <AttachmentIcon className="w-4 h-4" />}
                            </button>
                        )}
                        <input ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown} placeholder="Write a message…"
                            disabled={wsStatus !== "connected"}
                            className="flex-1 h-12 px-4 text-sm rounded-2xl bg-muted border border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                        />
                        <button onClick={sendMessage} disabled={!inputText.trim() || wsStatus !== "connected"}
                            className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all shadow-md shrink-0">
                            <Sent02Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="-mx-4 sm:-mx-6 -my-5 h-[calc(100vh-68px)] lg:h-[calc(100vh-56px)] flex overflow-hidden">
            <div className={`w-full lg:w-[360px] lg:shrink-0 border-r border-border bg-background overflow-hidden flex flex-col ${activeRoom ? "hidden lg:flex" : "flex"}`}>
                {ConversationList}
            </div>
            <div className={`flex-1 flex flex-col bg-background overflow-hidden ${activeRoom ? "flex" : "hidden lg:flex"}`}>
                {!activeRoom ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <BubbleChatIcon className="w-16 h-16 mb-4 opacity-20 text-muted-foreground" />
                        <h3 className="text-lg font-bold text-foreground">Select a conversation</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm">Choose a chat to start messaging your doctor, lab, or pharmacy.</p>
                    </div>
                ) : ChatRoom}
            </div>
        </div>
    )
}
