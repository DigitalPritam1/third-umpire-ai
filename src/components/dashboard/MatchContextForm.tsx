"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatchState } from "@/types";

interface MatchContextFormProps {
  onSubmit: (state: MatchState) => void;
  isLoading: boolean;
}

export function MatchContextForm({ onSubmit, isLoading }: MatchContextFormProps) {
  const [formData, setFormData] = useState<MatchState>({
    innings: 1,
    matchPhase: "Middle Overs",
    battingTeam: "CSK",
    bowlingTeam: "MI",
    currentScore: {
      runs: 145,
      wickets: 3,
      oversBowled: 15,
    },
    pitchConditions: "Turning",
    dewFactor: false,
    venue: "Chepauk",
    striker: "MS Dhoni",
    nonStriker: "Ravindra Jadeja",
    availableBowlers: [],
    impactPlayerAvailable: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl shadow-slate-900/50">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-400">Match Situation</CardTitle>
        <CardDescription className="text-slate-400">Input the current state of the game</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Innings</Label>
              <Select
                value={formData.innings.toString()}
                onValueChange={(v) => setFormData({ ...formData, innings: parseInt(v) as 1 | 2 })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Select Innings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Innings</SelectItem>
                  <SelectItem value="2">2nd Innings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Match Phase</Label>
              <Select
                value={formData.matchPhase}
                onValueChange={(v) => setFormData({ ...formData, matchPhase: v as any })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Powerplay">Powerplay (1-6)</SelectItem>
                  <SelectItem value="Middle Overs">Middle Overs (7-15)</SelectItem>
                  <SelectItem value="Death Overs">Death Overs (16-20)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Runs</Label>
              <Input
                type="number"
                className="bg-slate-950 border-slate-800"
                value={formData.currentScore.runs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentScore: { ...formData.currentScore, runs: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Wickets</Label>
              <Input
                type="number"
                className="bg-slate-950 border-slate-800"
                value={formData.currentScore.wickets}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentScore: { ...formData.currentScore, wickets: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Overs</Label>
              <Input
                type="number"
                step="0.1"
                className="bg-slate-950 border-slate-800"
                value={formData.currentScore.oversBowled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentScore: { ...formData.currentScore, oversBowled: parseFloat(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>

          {formData.innings === 2 && (
            <div className="space-y-2">
              <Label>Target Score</Label>
              <Input
                type="number"
                className="bg-slate-950 border-slate-800"
                value={formData.targetRuns || 0}
                onChange={(e) =>
                  setFormData({ ...formData, targetRuns: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pitch Conditions</Label>
              <Select
                value={formData.pitchConditions}
                onValueChange={(v) => setFormData({ ...formData, pitchConditions: v as any })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Select Pitch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flat">Flat / Batting</SelectItem>
                  <SelectItem value="Turning">Turning / Spin</SelectItem>
                  <SelectItem value="Two-Paced">Two-Paced / Slow</SelectItem>
                  <SelectItem value="Green/Seaming">Green / Seaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Select
                value={formData.venue}
                onValueChange={(v) => setFormData({ ...formData, venue: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chepauk">M. A. Chidambaram (Chepauk)</SelectItem>
                  <SelectItem value="Wankhede">Wankhede Stadium</SelectItem>
                  <SelectItem value="Chinnaswamy">M. Chinnaswamy Stadium</SelectItem>
                  <SelectItem value="Eden Gardens">Eden Gardens</SelectItem>
                  <SelectItem value="Narendra Modi">Narendra Modi Stadium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20" 
            disabled={isLoading}
          >
            {isLoading ? "Consulting Think Tank..." : "Consult Think Tank ⚡"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
