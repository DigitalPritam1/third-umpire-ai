"use client";

import { useEffect, useRef } from "react";
import { DebateLogEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, ShieldAlert, MessageSquare, Terminal } from "lucide-react";

interface DebateStreamViewerProps {
  logs: DebateLogEntry[];
}

export function DebateStreamViewer({ logs }: DebateStreamViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case "Stats Analyst":
        return <Database className="w-5 h-5 text-blue-400" />;
      case "Strategist":
        return <Brain className="w-5 h-5 text-emerald-400" />;
      case "Devil's Advocate":
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      case "Commentator":
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      default:
        return <Terminal className="w-5 h-5 text-slate-400" />;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case "Stats Analyst":
        return "text-blue-400";
      case "Strategist":
        return "text-emerald-400";
      case "Devil's Advocate":
        return "text-amber-500";
      case "Commentator":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-slate-900/50 h-full flex flex-col">
      <CardHeader className="border-b border-slate-800 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Terminal className="w-6 h-6" />
          The Think Tank
          <span className="ml-auto flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent 
        className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm max-h-[500px]"
        ref={scrollRef}
      >
        {logs.map((log, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="mt-0.5">{getAgentIcon(log.agent)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold ${getAgentColor(log.agent)}`}>
                  {log.agent}
                </span>
                <span className="text-xs text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {log.actionType === "ToolCall" ? (
                  <span className="italic text-slate-400">&gt; Executing tool: {log.message}</span>
                ) : (
                  log.message
                )}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-slate-500 py-10 italic">
            Waiting for match context...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
