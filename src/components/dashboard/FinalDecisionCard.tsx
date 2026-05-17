"use client";

import { FinalDecisionPayload } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Zap, AlertTriangle, MessageSquare, Terminal } from "lucide-react";

interface FinalDecisionCardProps {
  decision: FinalDecisionPayload;
}

export function FinalDecisionCard({ decision }: FinalDecisionCardProps) {
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-slate-900/50 h-full flex flex-col overflow-hidden">
      {/* Top Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10 uppercase tracking-widest text-xs px-3 py-1">
            <Zap className="w-3 h-3 mr-1 inline" /> Captain's Call
          </Badge>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confidence</span>
              <span className="text-lg font-bold text-slate-200">{decision.confidenceScore}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden bg-slate-950">
               <div 
                 className={`absolute bottom-0 w-full ${getConfidenceColor(decision.confidenceScore)} transition-all duration-1000`}
                 style={{ height: `${decision.confidenceScore}%` }}
               />
               <span className="relative z-10 text-xs font-bold mix-blend-difference">{decision.confidenceScore}</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold leading-tight text-white mb-4">
          {decision.tacticalDecision}
        </h2>
        
        <div className="flex gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none px-3 py-1 text-sm">
            Impact: {decision.winProbabilityDelta}
          </Badge>
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs defaultValue="commentary" className="flex-1 flex flex-col">
          <div className="px-6 pt-4 border-b border-slate-800">
            <TabsList className="bg-slate-950/50 w-full justify-start border border-slate-800/50">
              <TabsTrigger value="commentary" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" /> Commentary
              </TabsTrigger>
              <TabsTrigger value="alternative" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <AlertTriangle className="w-4 h-4 mr-2" /> Alternative Plan
              </TabsTrigger>
              <TabsTrigger value="factors" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                <ShieldCheck className="w-4 h-4 mr-2" /> Key Factors
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            <TabsContent value="commentary" className="mt-0 text-slate-300 leading-relaxed text-lg italic">
              "{decision.commentaryExplanation}"
            </TabsContent>
            
            <TabsContent value="alternative" className="mt-0">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Devil's Advocate Suggestion
                </h4>
                <p className="text-amber-200/90 font-medium mb-2">{decision.alternativeStrategy.strategy}</p>
                <p className="text-amber-200/70 text-sm">{decision.alternativeStrategy.reasoning}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="factors" className="mt-0">
              <ul className="space-y-3">
                {decision.keyFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 mt-0.5">{factor}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
