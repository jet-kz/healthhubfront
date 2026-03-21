"use client"

import { useEffect, useState } from "react"

export default function MapDebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>({})

    useEffect(() => {
        // Check environment variables
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Check WebGL support
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        // Get browser info
        const browserInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
        }

        setDebugInfo({
            token: {
                exists: !!mapboxToken,
                starts_with: mapboxToken?.substring(0, 3) || 'N/A',
                length: mapboxToken?.length || 0
            },
            webgl: {
                supported: !!gl,
                version: gl ? (gl as any).getParameter((gl as any).VERSION) : 'N/A',
                vendor: gl ? (gl as any).getParameter((gl as any).VENDOR) : 'N/A',
                renderer: gl ? (gl as any).getParameter((gl as any).RENDERER) : 'N/A'
            },
            browser: browserInfo
        })
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔧 Mapbox Debug Information</h1>

                <div className="space-y-6">
                    {/* Token Info */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            🔑 Mapbox Token Status
                        </h2>
                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Token Exists:</span>
                                <span className={debugInfo.token?.exists ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {debugInfo.token?.exists ? '✅ YES' : '❌ NO'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Starts With:</span>
                                <span className={debugInfo.token?.starts_with === 'pk.' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {debugInfo.token?.starts_with}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Token Length:</span>
                                <span>{debugInfo.token?.length} characters</span>
                            </div>
                        </div>
                    </div>

                    {/* WebGL Info */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            🎨 WebGL Support
                        </h2>
                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">WebGL Supported:</span>
                                <span className={debugInfo.webgl?.supported ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {debugInfo.webgl?.supported ? '✅ YES' : '❌ NO'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">WebGL Version:</span>
                                <span>{debugInfo.webgl?.version || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">GPU Vendor:</span>
                                <span>{debugInfo.webgl?.vendor || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">GPU Renderer:</span>
                                <span className="text-xs">{debugInfo.webgl?.renderer || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Browser Info */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            🌐 Browser Information
                        </h2>
                        <div className="space-y-2 font-mono text-sm">
                            <div>
                                <span className="text-slate-600">Platform:</span>
                                <div className="mt-1">{debugInfo.browser?.platform}</div>
                            </div>
                            <div>
                                <span className="text-slate-600">User Agent:</span>
                                <div className="mt-1 text-xs break-all">{debugInfo.browser?.userAgent}</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Items */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h2 className="text-xl font-semibold mb-4">💡 Next Steps</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>If token doesn't start with <code className="bg-white px-2 py-0.5 rounded">pk.</code>, update your .env.local</li>
                            <li>If WebGL is not supported, try a different browser (Chrome, Firefox, Edge)</li>
                            <li>If WebGL is supported but map still fails, check browser console (F12) for errors</li>
                            <li>Make sure you hard-refreshed the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
                        </ol>
                    </div>

                    <div className="flex gap-4">
                        <a href="/dashboard/search" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Back to Map
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                        >
                            Refresh Debug
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
