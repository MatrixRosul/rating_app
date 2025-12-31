(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/MatchHistory.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchHistory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function MatchHistory(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(19);
    if ($[0] !== "4aeab029dc68061674fbfc4a67b4219e58542ac9d3558c6542bc43d788c99d95") {
        for(let $i = 0; $i < 19; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4aeab029dc68061674fbfc4a67b4219e58542ac9d3558c6542bc43d788c99d95";
    }
    const { matches, players, playerId, limit, disableSorting: t1 } = t0;
    const disableSorting = t1 === undefined ? false : t1;
    let t2;
    if ($[1] !== players) {
        t2 = ({
            "MatchHistory[getPlayerById]": (id)=>players.find({
                    "MatchHistory[getPlayerById > players.find()]": (p)=>p.id === id
                }["MatchHistory[getPlayerById > players.find()]"])
        })["MatchHistory[getPlayerById]"];
        $[1] = players;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const getPlayerById = t2;
    let t3;
    if ($[3] !== disableSorting || $[4] !== matches) {
        t3 = disableSorting ? matches : [
            ...matches
        ].sort(_MatchHistoryAnonymous);
        $[3] = disableSorting;
        $[4] = matches;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const sortedMatches = t3;
    let t4;
    if ($[6] !== limit || $[7] !== sortedMatches) {
        t4 = limit ? sortedMatches.slice(0, limit) : sortedMatches;
        $[6] = limit;
        $[7] = sortedMatches;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    const displayedMatches = t4;
    if (displayedMatches.length === 0) {
        let t5;
        if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-md p-8 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "mx-auto h-12 w-12 text-gray-400",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MatchHistory.tsx",
                            lineNumber: 67,
                            columnNumber: 178
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 67,
                        columnNumber: 75
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mt-2 text-lg font-medium text-gray-900",
                        children: "Матчів поки немає"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 67,
                        columnNumber: 374
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-gray-500",
                        children: "Історія матчів з'явиться після першої гри"
                    }, void 0, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 67,
                        columnNumber: 451
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MatchHistory.tsx",
                lineNumber: 67,
                columnNumber: 12
            }, this);
            $[9] = t5;
        } else {
            t5 = $[9];
        }
        return t5;
    }
    let t5;
    if ($[10] !== displayedMatches || $[11] !== getPlayerById || $[12] !== playerId) {
        let t6;
        if ($[14] !== getPlayerById || $[15] !== playerId) {
            t6 = ({
                "MatchHistory[displayedMatches.map()]": (match)=>{
                    const player1 = getPlayerById(match.player1Id);
                    const player2 = getPlayerById(match.player2Id);
                    if (!player1 || !player2) {
                        return null;
                    }
                    const winner = match.winnerId === player1.id ? player1 : player2;
                    match.winnerId === player1.id ? player2 : player1;
                    const player1IsTarget = playerId === player1.id;
                    const player2IsTarget = playerId === player2.id;
                    const isTargetPlayerMatch = player1IsTarget || player2IsTarget;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `bg-white rounded-lg shadow-md p-4 border-l-4 ${isTargetPlayerMatch ? match.winnerId === playerId ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" : "border-gray-300"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex-1 ${player1IsTarget ? "font-semibold" : ""}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/player/${player1.id}`,
                                                        className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).textColor} hover:opacity-80 transition-colors`,
                                                        children: player1.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 420
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2 mt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).textColor,
                                                                children: match.player1RatingBefore
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 631
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-400",
                                                                children: "→"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 734
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).textColor,
                                                                children: match.player1RatingAfter
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 774
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-sm ${match.player1RatingChange > 0 ? "text-green-600" : match.player1RatingChange < 0 ? "text-red-600" : "text-gray-600"}`,
                                                                children: [
                                                                    "(",
                                                                    match.player1RatingChange > 0 ? "+" : "",
                                                                    match.player1RatingChange,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 875
                                                            }, this),
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingBefore).name !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-semibold px-2 py-1 rounded ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).color} text-white`,
                                                                children: [
                                                                    "Нове звання: ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player1RatingAfter).name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 1199
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 581
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 90,
                                                columnNumber: 352
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-lg font-bold text-gray-900",
                                                        children: [
                                                            match.player1Score,
                                                            " : ",
                                                            match.player2Score
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 1427
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-gray-500",
                                                        children: [
                                                            "до ",
                                                            match.maxScore
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 1525
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 90,
                                                columnNumber: 1398
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `flex-1 text-right ${player2IsTarget ? "font-semibold" : ""}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/player/${player2.id}`,
                                                        className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).textColor} hover:opacity-80 transition-colors`,
                                                        children: player2.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 1674
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end space-x-2 mt-1",
                                                        children: [
                                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).name !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-xs font-semibold px-2 py-1 rounded ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).color} text-white`,
                                                                children: [
                                                                    "Нове звання: ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 1996
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `text-sm ${match.player2RatingChange > 0 ? "text-green-600" : match.player2RatingChange < 0 ? "text-red-600" : "text-gray-600"}`,
                                                                children: [
                                                                    "(",
                                                                    match.player2RatingChange > 0 ? "+" : "",
                                                                    match.player2RatingChange,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2183
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingAfter).textColor,
                                                                children: match.player2RatingAfter
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2408
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-400",
                                                                children: "←"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2509
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.player2RatingBefore).textColor,
                                                                children: match.player2RatingBefore
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2549
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 1835
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 90,
                                                columnNumber: 1595
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                        lineNumber: 90,
                                        columnNumber: 307
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm text-gray-500",
                                                                children: "Переможець:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2812
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `/player/${winner.id}`,
                                                                className: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(match.winnerId === player1.id ? match.player1RatingAfter : match.player2RatingAfter).textColor} font-semibold hover:opacity-80 transition-colors`,
                                                                children: winner.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 2870
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 2767
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            match.tournament && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-gray-600",
                                                                children: [
                                                                    "📌 ",
                                                                    match.tournament
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 3173
                                                            }, this),
                                                            match.stage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `text-xs font-semibold px-2 py-0.5 rounded ${match.stage === "final" ? "bg-yellow-100 text-yellow-800" : match.stage === "semifinal" ? "bg-orange-100 text-orange-800" : match.stage === "quarterfinal" ? "bg-purple-100 text-purple-800" : match.stage === "round16" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`,
                                                                children: [
                                                                    match.stage === "final" ? "\uD83C\uDFC6 \u0424\u0456\u043D\u0430\u043B" : match.stage === "semifinal" ? "\uD83E\uDD48 \u041F\u0456\u0432\u0444\u0456\u043D\u0430\u043B" : match.stage === "quarterfinal" ? "\uD83E\uDD49 \u0427\u0432\u0435\u0440\u0442\u044C\u0444\u0456\u043D\u0430\u043B" : match.stage === "round16" ? "\u2694\uFE0F 1/8" : `📍 ${match.stage}`,
                                                                    match.matchWeight && match.matchWeight > 1 && ` ×${match.matchWeight.toFixed(1)}`
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 3256
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 3107
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 90,
                                                columnNumber: 2726
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm text-gray-500",
                                                children: new Date(match.date).toLocaleDateString("uk-UA", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MatchHistory.tsx",
                                                lineNumber: 90,
                                                columnNumber: 4056
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MatchHistory.tsx",
                                        lineNumber: 90,
                                        columnNumber: 2670
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MatchHistory.tsx",
                                lineNumber: 90,
                                columnNumber: 283
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/MatchHistory.tsx",
                            lineNumber: 90,
                            columnNumber: 232
                        }, this)
                    }, match.id, false, {
                        fileName: "[project]/src/components/MatchHistory.tsx",
                        lineNumber: 90,
                        columnNumber: 18
                    }, this);
                }
            })["MatchHistory[displayedMatches.map()]"];
            $[14] = getPlayerById;
            $[15] = playerId;
            $[16] = t6;
        } else {
            t6 = $[16];
        }
        t5 = displayedMatches.map(t6);
        $[10] = displayedMatches;
        $[11] = getPlayerById;
        $[12] = playerId;
        $[13] = t5;
    } else {
        t5 = $[13];
    }
    let t6;
    if ($[17] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-4",
            children: t5
        }, void 0, false, {
            fileName: "[project]/src/components/MatchHistory.tsx",
            lineNumber: 115,
            columnNumber: 10
        }, this);
        $[17] = t5;
        $[18] = t6;
    } else {
        t6 = $[18];
    }
    return t6;
}
_c = MatchHistory;
function _MatchHistoryAnonymous(a, b) {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) {
        return dateCompare;
    }
    return (b.sequenceIndex ?? -Infinity) - (a.sequenceIndex ?? -Infinity);
}
var _c;
__turbopack_context__.k.register(_c, "MatchHistory");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RatingChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RatingChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Кольорові зони рейтингу (як в Codeforces)
const RATING_BANDS = [
    {
        min: 0,
        max: 1199,
        color: '#808080',
        name: 'Newbie'
    },
    {
        min: 1200,
        max: 1399,
        color: '#008000',
        name: 'Pupil'
    },
    {
        min: 1400,
        max: 1599,
        color: '#03A89E',
        name: 'Specialist'
    },
    {
        min: 1600,
        max: 1799,
        color: '#0000FF',
        name: 'Expert'
    },
    {
        min: 1800,
        max: 2299,
        color: '#AA00AA',
        name: 'Candidate Master'
    },
    {
        min: 2300,
        max: 2499,
        color: '#FF8C00',
        name: 'Master'
    },
    {
        min: 2500,
        max: 9999,
        color: '#FF0000',
        name: 'Grandmaster'
    }
];
function RatingChart(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(93);
    if ($[0] !== "619b702b8a3103c31f754ede17045af894e9ff5760e70a4a4762b9c45772ec07") {
        for(let $i = 0; $i < 93; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "619b702b8a3103c31f754ede17045af894e9ff5760e70a4a4762b9c45772ec07";
    }
    const { player, matches, players: t1, className: t2 } = t0;
    let t3;
    if ($[1] !== t1) {
        t3 = t1 === undefined ? [] : t1;
        $[1] = t1;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const players = t3;
    const className = t2 === undefined ? "" : t2;
    const [hoveredIndex, setHoveredIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    let t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            x: 0,
            y: 0
        };
        $[3] = t4;
    } else {
        t4 = $[3];
    }
    const [tooltipPos, setTooltipPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t4);
    let t5;
    if ($[4] !== matches || $[5] !== player.createdAt || $[6] !== player.id || $[7] !== player.initialRating) {
        t5 = ({
            "RatingChart[createRatingHistory]": ()=>{
                const history = [];
                const playerMatches = matches.filter({
                    "RatingChart[createRatingHistory > matches.filter()]": (match)=>match.player1Id === player.id || match.player2Id === player.id
                }["RatingChart[createRatingHistory > matches.filter()]"]).sort(_RatingChartCreateRatingHistoryAnonymous);
                const createdAtDate = player.createdAt ? new Date(player.createdAt) : null;
                const firstMatchDate = playerMatches[0] ? new Date(playerMatches[0].date) : null;
                const initialDate = createdAtDate && firstMatchDate ? createdAtDate <= firstMatchDate ? createdAtDate : firstMatchDate : createdAtDate || firstMatchDate || new Date();
                const startingRating = player.initialRating ?? 1300;
                history.push({
                    date: initialDate,
                    rating: startingRating,
                    reason: "initial"
                });
                playerMatches.forEach({
                    "RatingChart[createRatingHistory > playerMatches.forEach()]": (match_0)=>{
                        const ratingAfter = match_0.player1Id === player.id ? match_0.player1RatingAfter : match_0.player2RatingAfter;
                        history.push({
                            date: new Date(match_0.date),
                            rating: ratingAfter,
                            matchId: match_0.id,
                            reason: "match"
                        });
                    }
                }["RatingChart[createRatingHistory > playerMatches.forEach()]"]);
                return history;
            }
        })["RatingChart[createRatingHistory]"];
        $[4] = matches;
        $[5] = player.createdAt;
        $[6] = player.id;
        $[7] = player.initialRating;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const createRatingHistory = t5;
    let ratingHistory;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t15;
    let t16;
    let t17;
    let t18;
    let t19;
    let t20;
    let t21;
    let t22;
    let t23;
    let t24;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[9] !== className || $[10] !== createRatingHistory || $[11] !== hoveredIndex || $[12] !== player.rating) {
        t24 = Symbol.for("react.early_return_sentinel");
        bb0: {
            ratingHistory = createRatingHistory();
            if (ratingHistory.length < 2) {
                let t25;
                if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
                    t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "Графік рейтингу"
                    }, void 0, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this);
                    $[33] = t25;
                } else {
                    t25 = $[33];
                }
                let t26;
                if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
                    t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-md p-6",
                        children: [
                            t25,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8 text-gray-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Недостатньо даних для побудови графіка"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 168,
                                        columnNumber: 121
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm mt-1",
                                        children: "Зіграйте кілька матчів, щоб побачити графік"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 168,
                                        columnNumber: 166
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RatingChart.tsx",
                                lineNumber: 168,
                                columnNumber: 73
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 168,
                        columnNumber: 17
                    }, this);
                    $[34] = t26;
                } else {
                    t26 = $[34];
                }
                t24 = t26;
                break bb0;
            }
            const minRating = Math.min(...ratingHistory.map(_RatingChartRatingHistoryMap));
            const maxRating = Math.max(...ratingHistory.map(_RatingChartRatingHistoryMap2));
            const ratingRange = maxRating - minRating;
            const padding = Math.max(50, ratingRange * 0.1);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(player.rating);
            let t25;
            if ($[35] !== player.rating) {
                t25 = ({
                    "RatingChart[RATING_BANDS.find()]": (band)=>band.min > player.rating
                })["RatingChart[RATING_BANDS.find()]"];
                $[35] = player.rating;
                $[36] = t25;
            } else {
                t25 = $[36];
            }
            const nextBand = RATING_BANDS.find(t25);
            const chartMinRating = Math.max(0, minRating - padding);
            const chartMaxRating = nextBand ? Math.max(maxRating + padding, nextBand.min + 100) : maxRating + padding;
            const chartRatingRange = chartMaxRating - chartMinRating;
            const xScale = {
                "RatingChart[xScale]": (index)=>60 + index / (ratingHistory.length - 1) * 700
            }["RatingChart[xScale]"];
            let t26;
            if ($[37] !== chartMinRating || $[38] !== chartRatingRange) {
                t26 = ({
                    "RatingChart[yScale]": (rating)=>340 - (rating - chartMinRating) / chartRatingRange * 320
                })["RatingChart[yScale]"];
                $[37] = chartMinRating;
                $[38] = chartRatingRange;
                $[39] = t26;
            } else {
                t26 = $[39];
            }
            const yScale = t26;
            const linePath = ratingHistory.map({
                "RatingChart[ratingHistory.map()]": (point, index_0)=>`${index_0 === 0 ? "M" : "L"} ${xScale(index_0)} ${yScale(point.rating)}`
            }["RatingChart[ratingHistory.map()]"]).join(" ");
            const years = Array.from(new Set(ratingHistory.map(_RatingChartRatingHistoryMap3))).sort(_RatingChartAnonymous);
            const yearPositions = years.map({
                "RatingChart[years.map()]": (year)=>{
                    const firstPointIdx = ratingHistory.findIndex({
                        "RatingChart[years.map() > ratingHistory.findIndex()]": (p_2)=>new Date(p_2.date).getFullYear() === year
                    }["RatingChart[years.map() > ratingHistory.findIndex()]"]);
                    if (firstPointIdx === -1) {
                        return null;
                    }
                    return {
                        year,
                        x: xScale(firstPointIdx)
                    };
                }
            }["RatingChart[years.map()]"]).filter(_RatingChartAnonymous2);
            let t27;
            if ($[40] !== chartMaxRating || $[41] !== chartMinRating) {
                t27 = ({
                    "RatingChart[RATING_BANDS.filter()]": (band_0)=>band_0.min < chartMaxRating && band_0.max > chartMinRating
                })["RatingChart[RATING_BANDS.filter()]"];
                $[40] = chartMaxRating;
                $[41] = chartMinRating;
                $[42] = t27;
            } else {
                t27 = $[42];
            }
            const ratingLevels = RATING_BANDS.filter(t27);
            t22 = `bg-white rounded-lg shadow-md p-6 ${className}`;
            if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
                t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-semibold text-gray-900 mb-4",
                    children: "Графік рейтингу"
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 242,
                    columnNumber: 15
                }, this);
                $[43] = t23;
            } else {
                t23 = $[43];
            }
            t21 = "relative overflow-x-auto";
            t6 = 800;
            t7 = 400;
            t8 = "border border-gray-200 rounded min-w-full md:min-w-0";
            t9 = "0 0 800 400";
            t10 = "xMidYMid meet";
            let t28;
            if ($[44] !== chartMaxRating || $[45] !== chartMinRating || $[46] !== yScale) {
                t28 = ({
                    "RatingChart[ratingLevels.map()]": (band_1, index_1)=>{
                        const bandTop = Math.max(band_1.min, chartMinRating);
                        const bandBottom = Math.min(band_1.max, chartMaxRating);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            x: 60,
                            y: yScale(bandBottom),
                            width: 700,
                            height: yScale(bandTop) - yScale(bandBottom),
                            fill: band_1.color,
                            fillOpacity: 0.1,
                            stroke: band_1.color,
                            strokeOpacity: 0.3,
                            strokeWidth: 0.5
                        }, index_1, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 259,
                            columnNumber: 20
                        }, this);
                    }
                })["RatingChart[ratingLevels.map()]"];
                $[44] = chartMaxRating;
                $[45] = chartMinRating;
                $[46] = yScale;
                $[47] = t28;
            } else {
                t28 = $[47];
            }
            t11 = ratingLevels.map(t28);
            let t29;
            if ($[48] !== chartMaxRating || $[49] !== chartMinRating || $[50] !== yScale) {
                t29 = ({
                    "RatingChart[ratingLevels.map()]": (band_2, index_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                            children: [
                                band_2.min,
                                band_2.max
                            ].filter({
                                "RatingChart[ratingLevels.map() > (anonymous)()]": (rating_0)=>rating_0 > chartMinRating && rating_0 < chartMaxRating
                            }["RatingChart[ratingLevels.map() > (anonymous)()]"]).map({
                                "RatingChart[ratingLevels.map() > (anonymous)()]": (rating_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: 60,
                                        y1: yScale(rating_1),
                                        x2: 760,
                                        y2: yScale(rating_1),
                                        stroke: band_2.color,
                                        strokeOpacity: 0.4,
                                        strokeWidth: 1,
                                        strokeDasharray: "2,2"
                                    }, rating_1, false, {
                                        fileName: "[project]/src/components/RatingChart.tsx",
                                        lineNumber: 276,
                                        columnNumber: 78
                                    }, this)
                            }["RatingChart[ratingLevels.map() > (anonymous)()]"])
                        }, `grid-${index_2}`, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 273,
                            columnNumber: 67
                        }, this)
                })["RatingChart[ratingLevels.map()]"];
                $[48] = chartMaxRating;
                $[49] = chartMinRating;
                $[50] = yScale;
                $[51] = t29;
            } else {
                t29 = $[51];
            }
            t12 = ratingLevels.map(t29);
            if ($[52] !== linePath) {
                t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: linePath,
                    fill: "none",
                    stroke: "#2563eb",
                    strokeWidth: 3,
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 288,
                    columnNumber: 15
                }, this);
                $[52] = linePath;
                $[53] = t13;
            } else {
                t13 = $[53];
            }
            t14 = ratingHistory.map({
                "RatingChart[ratingHistory.map()]": (point_0, index_3)=>{
                    const ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(point_0.rating);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: xScale(index_3),
                        cy: yScale(point_0.rating),
                        r: hoveredIndex === index_3 ? 7 : point_0.reason === "tournament" ? 6 : 4,
                        fill: ratingBand.color,
                        stroke: "#fff",
                        strokeWidth: 2,
                        className: "transition-all cursor-pointer hover:opacity-80",
                        onMouseEnter: {
                            "RatingChart[ratingHistory.map() > <circle>.onMouseEnter]": (e)=>{
                                setHoveredIndex(index_3);
                                const rect = e.target.getBoundingClientRect();
                                setTooltipPos({
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8
                                });
                            }
                        }["RatingChart[ratingHistory.map() > <circle>.onMouseEnter]"],
                        onMouseLeave: {
                            "RatingChart[ratingHistory.map() > <circle>.onMouseLeave]": ()=>setHoveredIndex(null)
                        }["RatingChart[ratingHistory.map() > <circle>.onMouseLeave]"]
                    }, index_3, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 297,
                        columnNumber: 18
                    }, this);
                }
            }["RatingChart[ratingHistory.map()]"]);
            if ($[54] === Symbol.for("react.memo_cache_sentinel")) {
                t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: 60,
                    y1: 20,
                    x2: 60,
                    y2: 340,
                    stroke: "#374151",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 312,
                    columnNumber: 15
                }, this);
                t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: 60,
                    y1: 340,
                    x2: 760,
                    y2: 340,
                    stroke: "#374151",
                    strokeWidth: 2
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 313,
                    columnNumber: 15
                }, this);
                $[54] = t15;
                $[55] = t16;
            } else {
                t15 = $[54];
                t16 = $[55];
            }
            t17 = yearPositions.map(_RatingChartYearPositionsMap);
            let t30;
            if ($[56] !== yScale) {
                t30 = ({
                    "RatingChart[ratingLevels.map()]": (band_3, index_4)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                            x: 50,
                            y: yScale(band_3.min) + 4,
                            textAnchor: "end",
                            fontSize: "12",
                            fill: band_3.color,
                            fontWeight: "600",
                            children: band_3.min
                        }, `label-${index_4}`, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 324,
                            columnNumber: 67
                        }, this)
                })["RatingChart[ratingLevels.map()]"];
                $[56] = yScale;
                $[57] = t30;
            } else {
                t30 = $[57];
            }
            t18 = ratingLevels.map(t30);
            const t31 = yScale(player.rating) + 4;
            if ($[58] !== player.rating || $[59] !== t31) {
                t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: 50,
                    y: t31,
                    textAnchor: "end",
                    fontSize: "14",
                    fill: "#1f2937",
                    fontWeight: "bold",
                    children: player.rating
                }, void 0, false, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 334,
                    columnNumber: 15
                }, this);
                $[58] = player.rating;
                $[59] = t31;
                $[60] = t19;
            } else {
                t19 = $[60];
            }
            t20 = nextBand && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                        x1: 60,
                        y1: yScale(nextBand.min),
                        x2: 760,
                        y2: yScale(nextBand.min),
                        stroke: nextBand.color,
                        strokeWidth: 2,
                        strokeDasharray: "6,4",
                        opacity: 0.7
                    }, void 0, false, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 341,
                        columnNumber: 27
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: 770,
                        y: yScale(nextBand.min) + 4,
                        textAnchor: "start",
                        fontSize: "13",
                        fill: nextBand.color,
                        fontWeight: "700",
                        children: [
                            nextBand.min,
                            " ▶ ",
                            nextBand.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RatingChart.tsx",
                        lineNumber: 341,
                        columnNumber: 180
                    }, this)
                ]
            }, void 0, true);
        }
        $[9] = className;
        $[10] = createRatingHistory;
        $[11] = hoveredIndex;
        $[12] = player.rating;
        $[13] = ratingHistory;
        $[14] = t10;
        $[15] = t11;
        $[16] = t12;
        $[17] = t13;
        $[18] = t14;
        $[19] = t15;
        $[20] = t16;
        $[21] = t17;
        $[22] = t18;
        $[23] = t19;
        $[24] = t20;
        $[25] = t21;
        $[26] = t22;
        $[27] = t23;
        $[28] = t24;
        $[29] = t6;
        $[30] = t7;
        $[31] = t8;
        $[32] = t9;
    } else {
        ratingHistory = $[13];
        t10 = $[14];
        t11 = $[15];
        t12 = $[16];
        t13 = $[17];
        t14 = $[18];
        t15 = $[19];
        t16 = $[20];
        t17 = $[21];
        t18 = $[22];
        t19 = $[23];
        t20 = $[24];
        t21 = $[25];
        t22 = $[26];
        t23 = $[27];
        t24 = $[28];
        t6 = $[29];
        t7 = $[30];
        t8 = $[31];
        t9 = $[32];
    }
    if (t24 !== Symbol.for("react.early_return_sentinel")) {
        return t24;
    }
    let t25;
    if ($[61] !== t10 || $[62] !== t11 || $[63] !== t12 || $[64] !== t13 || $[65] !== t14 || $[66] !== t15 || $[67] !== t16 || $[68] !== t17 || $[69] !== t18 || $[70] !== t19 || $[71] !== t20 || $[72] !== t6 || $[73] !== t7 || $[74] !== t8 || $[75] !== t9) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: t6,
            height: t7,
            className: t8,
            viewBox: t9,
            preserveAspectRatio: t10,
            children: [
                t11,
                t12,
                t13,
                t14,
                t15,
                t16,
                t17,
                t18,
                t19,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 394,
            columnNumber: 11
        }, this);
        $[61] = t10;
        $[62] = t11;
        $[63] = t12;
        $[64] = t13;
        $[65] = t14;
        $[66] = t15;
        $[67] = t16;
        $[68] = t17;
        $[69] = t18;
        $[70] = t19;
        $[71] = t20;
        $[72] = t6;
        $[73] = t7;
        $[74] = t8;
        $[75] = t9;
        $[76] = t25;
    } else {
        t25 = $[76];
    }
    let t26;
    if ($[77] !== hoveredIndex || $[78] !== matches || $[79] !== player.id || $[80] !== players || $[81] !== ratingHistory || $[82] !== tooltipPos) {
        t26 = hoveredIndex !== null && ratingHistory[hoveredIndex]?.matchId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-xs z-50 pointer-events-none",
            style: {
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -100%)",
                minWidth: "200px"
            },
            children: (()=>{
                const point_1 = ratingHistory[hoveredIndex];
                const matchData = matches.find({
                    "RatingChart[<anonymous> > matches.find()]": (m)=>m.id === point_1.matchId
                }["RatingChart[<anonymous> > matches.find()]"]);
                if (!matchData) {
                    return null;
                }
                const isP1 = matchData.player1Id === player.id;
                const opponentId = isP1 ? matchData.player2Id : matchData.player1Id;
                const opponent = players.find({
                    "RatingChart[<anonymous> > players.find()]": (p_4)=>p_4.id === opponentId
                }["RatingChart[<anonymous> > players.find()]"]);
                const opponentName = opponent ? opponent.name : "\u0421\u0443\u043F\u0435\u0440\u043D\u0438\u043A";
                const ratingChange = isP1 ? matchData.player1RatingChange : matchData.player2RatingChange;
                const playerScore = isP1 ? matchData.player1Score : matchData.player2Score;
                const opponentScore = isP1 ? matchData.player2Score : matchData.player1Score;
                const matchDate = new Date(matchData.date).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-yellow-300 font-semibold text-xs border-b border-gray-700 pb-1",
                            children: [
                                "vs ",
                                opponentName
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 55
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-white font-semibold text-sm",
                            children: [
                                playerScore,
                                ":",
                                opponentScore
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 163
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `font-bold text-base ${ratingChange >= 0 ? "text-green-400" : "text-red-400"}`,
                            children: [
                                ratingChange > 0 ? "+" : "",
                                ratingChange
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 248
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-blue-300 font-semibold text-sm border-t border-gray-700 pt-1",
                            children: [
                                "Рейтинг: ",
                                point_1.rating
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 393
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-300 text-xs",
                            children: matchDate
                        }, void 0, false, {
                            fileName: "[project]/src/components/RatingChart.tsx",
                            lineNumber: 443,
                            columnNumber: 507
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RatingChart.tsx",
                    lineNumber: 443,
                    columnNumber: 16
                }, this);
            })()
        }, void 0, false, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 416,
            columnNumber: 76
        }, this);
        $[77] = hoveredIndex;
        $[78] = matches;
        $[79] = player.id;
        $[80] = players;
        $[81] = ratingHistory;
        $[82] = tooltipPos;
        $[83] = t26;
    } else {
        t26 = $[83];
    }
    let t27;
    if ($[84] === Symbol.for("react.memo_cache_sentinel")) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-4 flex flex-wrap gap-3",
            children: RATING_BANDS.map(_RatingChartRATING_BANDSMap)
        }, void 0, false, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 457,
            columnNumber: 11
        }, this);
        $[84] = t27;
    } else {
        t27 = $[84];
    }
    let t28;
    if ($[85] !== t21 || $[86] !== t25 || $[87] !== t26) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t21,
            children: [
                t25,
                t26,
                t27
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 464,
            columnNumber: 11
        }, this);
        $[85] = t21;
        $[86] = t25;
        $[87] = t26;
        $[88] = t28;
    } else {
        t28 = $[88];
    }
    let t29;
    if ($[89] !== t22 || $[90] !== t23 || $[91] !== t28) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t22,
            children: [
                t23,
                t28
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RatingChart.tsx",
            lineNumber: 474,
            columnNumber: 11
        }, this);
        $[89] = t22;
        $[90] = t23;
        $[91] = t28;
        $[92] = t29;
    } else {
        t29 = $[92];
    }
    return t29;
}
_s(RatingChart, "bl8XosefRVsmVWwyTBCTqKYoPgc=");
_c = RatingChart;
function _RatingChartRATING_BANDSMap(band_4, index_5) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-4 h-4 rounded",
                style: {
                    backgroundColor: band_4.color
                }
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 485,
                columnNumber: 65
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-600",
                children: [
                    band_4.name,
                    " (",
                    band_4.min,
                    "-",
                    band_4.max === 4000 ? "\u221E" : band_4.max,
                    ")"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 487,
                columnNumber: 10
            }, this)
        ]
    }, index_5, true, {
        fileName: "[project]/src/components/RatingChart.tsx",
        lineNumber: 485,
        columnNumber: 10
    }, this);
}
function _RatingChartYearPositionsMap(pos, idx) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: pos.x,
                y1: 340,
                x2: pos.x,
                y2: 346,
                stroke: "#9ca3af",
                strokeWidth: 1
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 490,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: pos.x,
                y: 360,
                textAnchor: "middle",
                fontSize: "12",
                fill: "#6b7280",
                fontWeight: "500",
                children: pos.year
            }, void 0, false, {
                fileName: "[project]/src/components/RatingChart.tsx",
                lineNumber: 490,
                columnNumber: 114
            }, this)
        ]
    }, `year-${idx}`, true, {
        fileName: "[project]/src/components/RatingChart.tsx",
        lineNumber: 490,
        columnNumber: 10
    }, this);
}
function _RatingChartAnonymous2(p_3) {
    return p_3 !== null;
}
function _RatingChartAnonymous(a_0, b_0) {
    return a_0 - b_0;
}
function _RatingChartRatingHistoryMap3(p_1) {
    return new Date(p_1.date).getFullYear();
}
function _RatingChartRatingHistoryMap2(p_0) {
    return p_0.rating;
}
function _RatingChartRatingHistoryMap(p) {
    return p.rating;
}
function _RatingChartCreateRatingHistoryAnonymous(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
}
var _c;
__turbopack_context__.k.register(_c, "RatingChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/player/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/AppContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/rating.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MatchHistory.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RatingChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RatingChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function PlayerProfile() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(143);
    if ($[0] !== "fc039ce26458feda94ef7d4b1972213978d36577d8ede1f65d1f5befe50c94e2") {
        for(let $i = 0; $i < 143; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "fc039ce26458feda94ef7d4b1972213978d36577d8ede1f65d1f5befe50c94e2";
    }
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const playerId = decodeURIComponent(params.id);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("history");
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "PlayerProfile[useEffect()]": ()=>{
                setMounted(true);
            }
        })["PlayerProfile[useEffect()]"];
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    if (!mounted || state.loading || !state.isClient) {
        let t2;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-white shadow-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between py-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "text-gray-600 hover:text-gray-900 transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "h-6 w-6",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M15 19l-7-7 7-7"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 45,
                                            columnNumber: 366
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 45,
                                        columnNumber: 287
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 45,
                                    columnNumber: 208
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-gray-900",
                                    children: "Профіль гравця"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 45,
                                    columnNumber: 468
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 45,
                            columnNumber: 163
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 45,
                        columnNumber: 107
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 45,
                    columnNumber: 51
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 45,
                columnNumber: 12
            }, this);
            $[3] = t2;
        } else {
            t2 = $[3];
        }
        let t3;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gray-100",
                children: [
                    t2,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 52,
                                    columnNumber: 214
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg",
                                    children: "Завантаження..."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 52,
                                    columnNumber: 294
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 52,
                            columnNumber: 120
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 52,
                        columnNumber: 58
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 52,
                columnNumber: 12
            }, this);
            $[4] = t3;
        } else {
            t3 = $[4];
        }
        return t3;
    }
    const t2 = state.players;
    let bestMatches;
    let player;
    let playerMatches_0;
    let playerRank;
    let ratingBand;
    let stats;
    let t3;
    let t4;
    let virtualPlayer;
    if ($[5] !== playerId || $[6] !== state.matches || $[7] !== state.players) {
        t4 = Symbol.for("react.early_return_sentinel");
        bb0: {
            let t5;
            if ($[17] !== playerId) {
                t5 = ({
                    "PlayerProfile[state.players.find()]": (p)=>p.id === playerId
                })["PlayerProfile[state.players.find()]"];
                $[17] = playerId;
                $[18] = t5;
            } else {
                t5 = $[18];
            }
            player = t2.find(t5);
            virtualPlayer = player;
            if (!player) {
                let t6;
                if ($[19] !== playerId) {
                    t6 = ({
                        "PlayerProfile[state.matches.filter()]": (match)=>match.player1Id === playerId || match.player2Id === playerId
                    })["PlayerProfile[state.matches.filter()]"];
                    $[19] = playerId;
                    $[20] = t6;
                } else {
                    t6 = $[20];
                }
                const playerMatches = state.matches.filter(t6);
                if (playerMatches.length > 0) {
                    const lastMatch = playerMatches[playerMatches.length - 1];
                    const isPlayer1 = lastMatch.player1Id === playerId;
                    const currentRating = isPlayer1 ? lastMatch.player1RatingAfter : lastMatch.player2RatingAfter;
                    const playerName = isPlayer1 ? lastMatch.player1Name || `Гравець ${playerId}` : lastMatch.player2Name || `Гравець ${playerId}`;
                    virtualPlayer = {
                        id: playerId,
                        name: playerName,
                        rating: currentRating,
                        matches: playerMatches.map(_PlayerProfilePlayerMatchesMap),
                        createdAt: new Date(playerMatches[0].date),
                        updatedAt: new Date(lastMatch.date)
                    };
                }
            }
            if (!virtualPlayer) {
                let t6;
                if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
                    t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-h-screen bg-gray-100 flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-lg shadow-lg p-8 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-400 mb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "mx-auto h-12 w-12",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 114,
                                            columnNumber: 279
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 190
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 154
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl font-bold text-gray-900 mb-2",
                                    children: "Гравця не знайдено"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 432
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-600 mb-4",
                                    children: "Гравець з таким ID не існує"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 508
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block",
                                    children: "Повернутися до рейтингу"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 114,
                                    columnNumber: 573
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 114,
                            columnNumber: 91
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 114,
                        columnNumber: 16
                    }, this);
                    $[21] = t6;
                } else {
                    t6 = $[21];
                }
                t4 = t6;
                break bb0;
            }
            ratingBand = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(virtualPlayer.rating);
            stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePlayerStats"])(virtualPlayer, state.matches);
            playerMatches_0 = state.matches.filter({
                "PlayerProfile[state.matches.filter()]": (match_0)=>match_0.player1Id === virtualPlayer.id || match_0.player2Id === virtualPlayer.id
            }["PlayerProfile[state.matches.filter()]"]);
            bestMatches = [
                ...playerMatches_0
            ].sort({
                "PlayerProfile[(anonymous)()]": (a, b)=>{
                    const aChange = a.player1Id === virtualPlayer.id ? a.player1RatingChange : a.player2RatingChange;
                    const bChange = b.player1Id === virtualPlayer.id ? b.player1RatingChange : b.player2RatingChange;
                    return bChange - aChange;
                }
            }["PlayerProfile[(anonymous)()]"]);
            const sortedPlayers = [
                ...state.players
            ].sort(_PlayerProfileAnonymous);
            playerRank = sortedPlayers.findIndex({
                "PlayerProfile[sortedPlayers.findIndex()]": (p_0)=>p_0.id === virtualPlayer.id
            }["PlayerProfile[sortedPlayers.findIndex()]"]) + 1;
            t3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$rating$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRatingBand"])(stats.highestRating);
        }
        $[5] = playerId;
        $[6] = state.matches;
        $[7] = state.players;
        $[8] = bestMatches;
        $[9] = player;
        $[10] = playerMatches_0;
        $[11] = playerRank;
        $[12] = ratingBand;
        $[13] = stats;
        $[14] = t3;
        $[15] = t4;
        $[16] = virtualPlayer;
    } else {
        bestMatches = $[8];
        player = $[9];
        playerMatches_0 = $[10];
        playerRank = $[11];
        ratingBand = $[12];
        stats = $[13];
        t3 = $[14];
        t4 = $[15];
        virtualPlayer = $[16];
    }
    if (t4 !== Symbol.for("react.early_return_sentinel")) {
        return t4;
    }
    const highestRatingBand = t3;
    const hasRankChanged = highestRatingBand.name !== ratingBand.name;
    let t5;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "bg-white shadow-md",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between py-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "text-gray-600 hover:text-gray-900 transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "h-6 w-6",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M15 19l-7-7 7-7"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/player/[id]/page.tsx",
                                            lineNumber: 170,
                                            columnNumber: 364
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/player/[id]/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 285
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 206
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold text-gray-900",
                                    children: "Профіль гравця"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/player/[id]/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 466
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 170,
                            columnNumber: 161
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors",
                            children: "До рейтингу"
                        }, void 0, false, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 170,
                            columnNumber: 540
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 170,
                    columnNumber: 105
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 170,
                columnNumber: 49
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 170,
            columnNumber: 10
        }, this);
        $[22] = t5;
    } else {
        t5 = $[22];
    }
    let t6;
    if ($[23] !== playerRank) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full text-xl font-bold text-gray-600",
            children: [
                "#",
                playerRank
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 177,
            columnNumber: 10
        }, this);
        $[23] = playerRank;
        $[24] = t6;
    } else {
        t6 = $[24];
    }
    const t7 = `text-3xl font-bold ${ratingBand.textColor}`;
    let t8;
    if ($[25] !== t7 || $[26] !== virtualPlayer.name) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: t7,
            children: virtualPlayer.name
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 186,
            columnNumber: 10
        }, this);
        $[25] = t7;
        $[26] = virtualPlayer.name;
        $[27] = t8;
    } else {
        t8 = $[27];
    }
    let t9;
    if ($[28] !== virtualPlayer.isCMS) {
        t9 = virtualPlayer.isCMS && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-amber-600 text-sm font-extrabold italic tracking-wide px-2 py-1 bg-amber-50 rounded border border-amber-300",
            title: "\u041A\u0430\u043D\u0434\u0438\u0434\u0430\u0442 \u0443 \u041C\u0430\u0439\u0441\u0442\u0440\u0438 \u0421\u043F\u043E\u0440\u0442\u0443 \u0423\u043A\u0440\u0430\u0457\u043D\u0438",
            style: {
                transform: "skewX(-3deg)"
            },
            children: "КМСУ"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 195,
            columnNumber: 33
        }, this);
        $[28] = virtualPlayer.isCMS;
        $[29] = t9;
    } else {
        t9 = $[29];
    }
    let t10;
    if ($[30] !== t8 || $[31] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-3",
            children: [
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 205,
            columnNumber: 11
        }, this);
        $[30] = t8;
        $[31] = t9;
        $[32] = t10;
    } else {
        t10 = $[32];
    }
    let t11;
    if ($[33] !== ratingBand.name) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: ratingBand.name
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 214,
            columnNumber: 11
        }, this);
        $[33] = ratingBand.name;
        $[34] = t11;
    } else {
        t11 = $[34];
    }
    let t12;
    if ($[35] !== virtualPlayer.city || $[36] !== virtualPlayer.yearOfBirth) {
        t12 = (virtualPlayer.city || virtualPlayer.yearOfBirth) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm",
            children: [
                virtualPlayer.city,
                virtualPlayer.yearOfBirth && `${virtualPlayer.yearOfBirth} р.н.`
            ].filter(Boolean).join(" \u2022 ")
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 222,
            columnNumber: 64
        }, this);
        $[35] = virtualPlayer.city;
        $[36] = virtualPlayer.yearOfBirth;
        $[37] = t12;
    } else {
        t12 = $[37];
    }
    let t13;
    if ($[38] !== t11 || $[39] !== t12) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-lg text-gray-600 space-y-1",
            children: [
                t11,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 231,
            columnNumber: 11
        }, this);
        $[38] = t11;
        $[39] = t12;
        $[40] = t13;
    } else {
        t13 = $[40];
    }
    let t14;
    if ($[41] !== t10 || $[42] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t10,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 240,
            columnNumber: 11
        }, this);
        $[41] = t10;
        $[42] = t13;
        $[43] = t14;
    } else {
        t14 = $[43];
    }
    let t15;
    if ($[44] !== t14 || $[45] !== t6) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-4",
            children: [
                t6,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 249,
            columnNumber: 11
        }, this);
        $[44] = t14;
        $[45] = t6;
        $[46] = t15;
    } else {
        t15 = $[46];
    }
    const t16 = `text-4xl font-bold ${ratingBand.textColor}`;
    let t17;
    if ($[47] !== t16 || $[48] !== virtualPlayer.rating) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t16,
            children: virtualPlayer.rating
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 259,
            columnNumber: 11
        }, this);
        $[47] = t16;
        $[48] = virtualPlayer.rating;
        $[49] = t17;
    } else {
        t17 = $[49];
    }
    const t18 = `w-4 h-4 rounded-full ${ratingBand.color}`;
    let t19;
    if ($[50] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t18
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 269,
            columnNumber: 11
        }, this);
        $[50] = t18;
        $[51] = t19;
    } else {
        t19 = $[51];
    }
    const t20 = `text-sm font-medium ${ratingBand.textColor}`;
    let t21;
    if ($[52] !== ratingBand.name || $[53] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t20,
            children: ratingBand.name
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 278,
            columnNumber: 11
        }, this);
        $[52] = ratingBand.name;
        $[53] = t20;
        $[54] = t21;
    } else {
        t21 = $[54];
    }
    let t22;
    if ($[55] !== t19 || $[56] !== t21) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-end space-x-2 mt-2",
            children: [
                t19,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 287,
            columnNumber: 11
        }, this);
        $[55] = t19;
        $[56] = t21;
        $[57] = t22;
    } else {
        t22 = $[57];
    }
    let t23;
    if ($[58] !== t17 || $[59] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-right",
            children: [
                t17,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 296,
            columnNumber: 11
        }, this);
        $[58] = t17;
        $[59] = t22;
        $[60] = t23;
    } else {
        t23 = $[60];
    }
    let t24;
    if ($[61] !== t15 || $[62] !== t23) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between mb-6",
            children: [
                t15,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 305,
            columnNumber: 11
        }, this);
        $[61] = t15;
        $[62] = t23;
        $[63] = t24;
    } else {
        t24 = $[63];
    }
    let t25;
    if ($[64] !== stats.totalMatches) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-2xl font-bold text-blue-600",
            children: stats.totalMatches
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 314,
            columnNumber: 11
        }, this);
        $[64] = stats.totalMatches;
        $[65] = t25;
    } else {
        t25 = $[65];
    }
    let t26;
    if ($[66] === Symbol.for("react.memo_cache_sentinel")) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "Матчів"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 322,
            columnNumber: 11
        }, this);
        $[66] = t26;
    } else {
        t26 = $[66];
    }
    let t27;
    if ($[67] !== t25) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t25,
                t26
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 329,
            columnNumber: 11
        }, this);
        $[67] = t25;
        $[68] = t27;
    } else {
        t27 = $[68];
    }
    let t28;
    if ($[69] !== stats.wins) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-2xl font-bold text-green-600",
            children: stats.wins
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 337,
            columnNumber: 11
        }, this);
        $[69] = stats.wins;
        $[70] = t28;
    } else {
        t28 = $[70];
    }
    let t29;
    if ($[71] === Symbol.for("react.memo_cache_sentinel")) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "Перемог"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 345,
            columnNumber: 11
        }, this);
        $[71] = t29;
    } else {
        t29 = $[71];
    }
    let t30;
    if ($[72] !== t28) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t28,
                t29
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 352,
            columnNumber: 11
        }, this);
        $[72] = t28;
        $[73] = t30;
    } else {
        t30 = $[73];
    }
    let t31;
    if ($[74] !== stats.losses) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-2xl font-bold text-red-600",
            children: stats.losses
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 360,
            columnNumber: 11
        }, this);
        $[74] = stats.losses;
        $[75] = t31;
    } else {
        t31 = $[75];
    }
    let t32;
    if ($[76] === Symbol.for("react.memo_cache_sentinel")) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "Поразок"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 368,
            columnNumber: 11
        }, this);
        $[76] = t32;
    } else {
        t32 = $[76];
    }
    let t33;
    if ($[77] !== t31) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t31,
                t32
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 375,
            columnNumber: 11
        }, this);
        $[77] = t31;
        $[78] = t33;
    } else {
        t33 = $[78];
    }
    let t34;
    if ($[79] !== stats.winRate) {
        t34 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-2xl font-bold text-purple-600",
            children: [
                stats.winRate,
                "%"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 383,
            columnNumber: 11
        }, this);
        $[79] = stats.winRate;
        $[80] = t34;
    } else {
        t34 = $[80];
    }
    let t35;
    if ($[81] === Symbol.for("react.memo_cache_sentinel")) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "% Перемог"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 391,
            columnNumber: 11
        }, this);
        $[81] = t35;
    } else {
        t35 = $[81];
    }
    let t36;
    if ($[82] !== t34) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t34,
                t35
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 398,
            columnNumber: 11
        }, this);
        $[82] = t34;
        $[83] = t36;
    } else {
        t36 = $[83];
    }
    const t37 = `text-2xl font-bold ${highestRatingBand.textColor}`;
    let t38;
    if ($[84] !== stats.highestRating || $[85] !== t37) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t37,
            children: stats.highestRating
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 407,
            columnNumber: 11
        }, this);
        $[84] = stats.highestRating;
        $[85] = t37;
        $[86] = t38;
    } else {
        t38 = $[86];
    }
    let t39;
    if ($[87] === Symbol.for("react.memo_cache_sentinel")) {
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "Макс рейтинг"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 416,
            columnNumber: 11
        }, this);
        $[87] = t39;
    } else {
        t39 = $[87];
    }
    const t40 = `text-xs font-medium mt-1 ${highestRatingBand.textColor}`;
    let t41;
    if ($[88] !== highestRatingBand.name || $[89] !== t40) {
        t41 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t40,
            children: highestRatingBand.name
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 424,
            columnNumber: 11
        }, this);
        $[88] = highestRatingBand.name;
        $[89] = t40;
        $[90] = t41;
    } else {
        t41 = $[90];
    }
    let t42;
    if ($[91] !== hasRankChanged || $[92] !== player || $[93] !== stats.highestRating) {
        t42 = player && hasRankChanged && stats.highestRating > player.rating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-xs text-amber-600 font-semibold mt-1",
            children: "Найкраще звання"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 433,
            columnNumber: 78
        }, this);
        $[91] = hasRankChanged;
        $[92] = player;
        $[93] = stats.highestRating;
        $[94] = t42;
    } else {
        t42 = $[94];
    }
    let t43;
    if ($[95] !== t38 || $[96] !== t41 || $[97] !== t42) {
        t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t38,
                t39,
                t41,
                t42
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 443,
            columnNumber: 11
        }, this);
        $[95] = t38;
        $[96] = t41;
        $[97] = t42;
        $[98] = t43;
    } else {
        t43 = $[98];
    }
    const t44 = `text-2xl font-bold ${stats.ratingChange >= 0 ? "text-green-600" : "text-red-600"}`;
    const t45 = stats.ratingChange >= 0 ? "+" : "";
    let t46;
    if ($[99] !== stats.ratingChange || $[100] !== t44 || $[101] !== t45) {
        t46 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t44,
            children: [
                t45,
                stats.ratingChange
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 455,
            columnNumber: 11
        }, this);
        $[99] = stats.ratingChange;
        $[100] = t44;
        $[101] = t45;
        $[102] = t46;
    } else {
        t46 = $[102];
    }
    let t47;
    if ($[103] === Symbol.for("react.memo_cache_sentinel")) {
        t47 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-sm text-gray-600",
            children: "Зміна рейтингу"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 465,
            columnNumber: 11
        }, this);
        $[103] = t47;
    } else {
        t47 = $[103];
    }
    let t48;
    if ($[104] !== t46) {
        t48 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center p-4 bg-gray-50 rounded-lg",
            children: [
                t46,
                t47
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 472,
            columnNumber: 11
        }, this);
        $[104] = t46;
        $[105] = t48;
    } else {
        t48 = $[105];
    }
    let t49;
    if ($[106] !== t27 || $[107] !== t30 || $[108] !== t33 || $[109] !== t36 || $[110] !== t43 || $[111] !== t48) {
        t49 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4",
            children: [
                t27,
                t30,
                t33,
                t36,
                t43,
                t48
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 480,
            columnNumber: 11
        }, this);
        $[106] = t27;
        $[107] = t30;
        $[108] = t33;
        $[109] = t36;
        $[110] = t43;
        $[111] = t48;
        $[112] = t49;
    } else {
        t49 = $[112];
    }
    let t50;
    if ($[113] !== t24 || $[114] !== t49) {
        t50 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-md p-6 mb-8",
            children: [
                t24,
                t49
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 493,
            columnNumber: 11
        }, this);
        $[113] = t24;
        $[114] = t49;
        $[115] = t50;
    } else {
        t50 = $[115];
    }
    let t51;
    if ($[116] !== state.matches || $[117] !== state.players || $[118] !== virtualPlayer) {
        t51 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RatingChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                player: virtualPlayer,
                matches: state.matches,
                players: state.players
            }, void 0, false, {
                fileName: "[project]/src/app/player/[id]/page.tsx",
                lineNumber: 502,
                columnNumber: 33
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 502,
            columnNumber: 11
        }, this);
        $[116] = state.matches;
        $[117] = state.players;
        $[118] = virtualPlayer;
        $[119] = t51;
    } else {
        t51 = $[119];
    }
    let t52;
    if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
        t52 = ({
            "PlayerProfile[<button>.onClick]": ()=>setActiveTab("history")
        })["PlayerProfile[<button>.onClick]"];
        $[120] = t52;
    } else {
        t52 = $[120];
    }
    const t53 = `px-4 py-2 font-semibold transition-colors border-b-2 ${activeTab === "history" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`;
    let t54;
    if ($[121] !== playerMatches_0.length || $[122] !== t53) {
        t54 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t52,
            className: t53,
            children: [
                "Історія матчів (",
                playerMatches_0.length,
                ")"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 522,
            columnNumber: 11
        }, this);
        $[121] = playerMatches_0.length;
        $[122] = t53;
        $[123] = t54;
    } else {
        t54 = $[123];
    }
    let t55;
    if ($[124] === Symbol.for("react.memo_cache_sentinel")) {
        t55 = ({
            "PlayerProfile[<button>.onClick]": ()=>setActiveTab("best")
        })["PlayerProfile[<button>.onClick]"];
        $[124] = t55;
    } else {
        t55 = $[124];
    }
    const t56 = `px-4 py-2 font-semibold transition-colors border-b-2 ${activeTab === "best" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`;
    let t57;
    if ($[125] !== t56) {
        t57 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t55,
            className: t56,
            children: "Найкращі матчі"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 541,
            columnNumber: 11
        }, this);
        $[125] = t56;
        $[126] = t57;
    } else {
        t57 = $[126];
    }
    let t58;
    if ($[127] !== t54 || $[128] !== t57) {
        t58 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex space-x-4 mb-6 border-b border-gray-200",
            children: [
                t54,
                t57
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 549,
            columnNumber: 11
        }, this);
        $[127] = t54;
        $[128] = t57;
        $[129] = t58;
    } else {
        t58 = $[129];
    }
    let t59;
    if ($[130] !== activeTab || $[131] !== bestMatches || $[132] !== playerMatches_0 || $[133] !== state.players || $[134] !== virtualPlayer.id) {
        t59 = playerMatches_0.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MatchHistory$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            matches: activeTab === "history" ? playerMatches_0 : bestMatches,
            players: state.players,
            playerId: virtualPlayer.id,
            disableSorting: activeTab === "best"
        }, void 0, false, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 558,
            columnNumber: 40
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-gray-400 mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "mx-auto h-12 w-12",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        }, void 0, false, {
                            fileName: "[project]/src/app/player/[id]/page.tsx",
                            lineNumber: 558,
                            columnNumber: 375
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/player/[id]/page.tsx",
                        lineNumber: 558,
                        columnNumber: 286
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 558,
                    columnNumber: 250
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-medium text-gray-900 mb-2",
                    children: "Матчів поки немає"
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 558,
                    columnNumber: 577
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600",
                    children: "Цей гравець ще не грав жодного матчу"
                }, void 0, false, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 558,
                    columnNumber: 654
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 558,
            columnNumber: 215
        }, this);
        $[130] = activeTab;
        $[131] = bestMatches;
        $[132] = playerMatches_0;
        $[133] = state.players;
        $[134] = virtualPlayer.id;
        $[135] = t59;
    } else {
        t59 = $[135];
    }
    let t60;
    if ($[136] !== t58 || $[137] !== t59) {
        t60 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-md p-6",
            children: [
                t58,
                t59
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 570,
            columnNumber: 11
        }, this);
        $[136] = t58;
        $[137] = t59;
        $[138] = t60;
    } else {
        t60 = $[138];
    }
    let t61;
    if ($[139] !== t50 || $[140] !== t51 || $[141] !== t60) {
        t61 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-100",
            children: [
                t5,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                    children: [
                        t50,
                        t51,
                        t60
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/player/[id]/page.tsx",
                    lineNumber: 579,
                    columnNumber: 57
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/player/[id]/page.tsx",
            lineNumber: 579,
            columnNumber: 11
        }, this);
        $[139] = t50;
        $[140] = t51;
        $[141] = t60;
        $[142] = t61;
    } else {
        t61 = $[142];
    }
    return t61;
}
_s(PlayerProfile, "lnAVhHDx6/pUdjAM1J3AGBBVBNU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = PlayerProfile;
function _PlayerProfileAnonymous(a_0, b_0) {
    return b_0.rating - a_0.rating;
}
function _PlayerProfilePlayerMatchesMap(m) {
    return m.id;
}
var _c;
__turbopack_context__.k.register(_c, "PlayerProfile");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_931b554a._.js.map