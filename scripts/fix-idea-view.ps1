$file = "src\components\studio\StoryArcStudio.tsx"
$content = Get-Content $file -Raw

# New simple Idea view content
$newIdeaView = @'
                {/* IDEA VIEW - Story Overview */}
                {viewMode === 'idea' && (
                    <div className="p-6 space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <h3 className="text-xs font-bold text-gray-900">Premise</h3>
                            </div>
                            <p className="text-sm text-gray-700">{story.premise || <span className="text-gray-400 italic">No premise yet</span>}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <h3 className="text-xs font-bold text-gray-900">Synopsis</h3>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-4">{story.synopsis || <span className="text-gray-400 italic">No synopsis yet</span>}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers className="h-4 w-4 text-purple-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Structure</h3>
                                </div>
                                <Badge className="text-xs bg-purple-100 text-purple-700">{story.structure === 'hero' ? "Hero's Journey" : story.structure === 'cat' ? "Save the Cat" : "Dan Harmon"}</Badge>
                                <span className="text-xs text-gray-500 ml-2">{beats.length} beats</span>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Theme</h3>
                                </div>
                                <p className="text-sm text-gray-700">{story.theme || '-'}</p>
                            </div>
                        </div>
                        {story.wantNeedMatrix && (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4 text-orange-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Want vs Need</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <h4 className="text-[10px] font-bold text-orange-600 mb-1">WANT</h4>
                                        <p className="text-xs text-gray-600">{story.wantNeedMatrix.want?.external || '-'}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <h4 className="text-[10px] font-bold text-purple-600 mb-1">NEED</h4>
                                        <p className="text-xs text-gray-600">{story.wantNeedMatrix.need?.internal || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">Edit beats, graph, dan key actions di Beats view</p>
                            <Button onClick={() => setViewMode('beats')} className="bg-orange-500 hover:bg-orange-600">
                                <Zap className="h-4 w-4 mr-2" /> Go to Beats
                            </Button>
                        </div>
                    </div>
                )}

                {/* BEATS CARD VIEW */}
'@

# Find old Idea view pattern to replace
$startMarker = "                {/* IDEA VIEW (formerly Arc) */}"
$endMarker = "                {/* BEATS CARD VIEW */}"

$startIdx = $content.IndexOf($startMarker)
$endIdx = $content.IndexOf($endMarker)

if ($startIdx -gt 0 -and $endIdx -gt 0) {
    $newContent = $content.Substring(0, $startIdx) + $newIdeaView + $content.Substring($endIdx + $endMarker.Length)
    Set-Content $file $newContent -NoNewline
    Write-Host "Success! Replaced Idea view content."
} else {
    Write-Host "Error: Markers not found. Start: $startIdx, End: $endIdx"
}
