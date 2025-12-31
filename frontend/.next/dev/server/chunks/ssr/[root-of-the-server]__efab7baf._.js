module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * API client for backend communication
 * All data comes from FastAPI backend
 */ __turbopack_context__.s([
    "fetchMatches",
    ()=>fetchMatches,
    "fetchPlayer",
    ()=>fetchPlayer,
    "fetchPlayers",
    ()=>fetchPlayers
]);
const API_URL = ("TURBOPACK compile-time value", "http://localhost:8000") || 'http://localhost:8000';
async function fetchPlayers() {
    const response = await fetch(`${API_URL}/api/players/`);
    if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
    }
    const data = await response.json();
    // Convert snake_case to camelCase for frontend
    return data.map((p)=>({
            id: p.id,
            name: p.name,
            firstName: p.first_name,
            lastName: p.last_name,
            city: p.city,
            yearOfBirth: p.year_of_birth,
            rating: p.rating,
            initialRating: p.initial_rating,
            peakRating: p.peak_rating,
            isCMS: p.is_cms,
            matches: [],
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at || p.created_at),
            matchesCount: p.matches_count
        }));
}
async function fetchPlayer(id) {
    const response = await fetch(`${API_URL}/api/players/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch player: ${response.statusText}`);
    }
    return response.json();
}
async function fetchMatches(playerId) {
    const url = playerId ? `${API_URL}/api/matches/?player_id=${playerId}` : `${API_URL}/api/matches/`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }
    const data = await response.json();
    // Convert snake_case to camelCase for frontend
    return data.map((m)=>({
            id: m.id,
            player1Id: m.player1_id,
            player2Id: m.player2_id,
            player1Name: m.player1_name,
            player2Name: m.player2_name,
            winnerId: m.winner_id,
            player1Score: m.player1_score,
            player2Score: m.player2_score,
            maxScore: m.max_score,
            player1RatingBefore: m.player1_rating_before,
            player2RatingBefore: m.player2_rating_before,
            player1RatingAfter: m.player1_rating_after,
            player2RatingAfter: m.player2_rating_after,
            player1RatingChange: m.player1_rating_change,
            player2RatingChange: m.player2_rating_change,
            date: new Date(m.date),
            createdAt: new Date(m.created_at)
        }));
}
}),
"[project]/src/context/AppContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const initialState = {
    players: [],
    matches: [],
    loading: true,
    error: null
};
function appReducer(state, action) {
    switch(action.type){
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        case 'INITIALIZE_DATA':
            return {
                ...state,
                players: action.payload.players,
                matches: action.payload.matches,
                loading: false,
                error: null
            };
        case 'RELOAD_DATA':
            return {
                ...state,
                loading: true
            };
        default:
            return state;
    }
}
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AppProvider({ children }) {
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(appReducer, initialState);
    // Load data from API on mount
    const loadData = async ()=>{
        try {
            dispatch({
                type: 'SET_LOADING',
                payload: true
            });
            const [playersData, matchesData] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchPlayers"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchMatches"])()
            ]);
            // Populate players' matches arrays
            const playersWithMatches = playersData.map((player)=>({
                    ...player,
                    matches: matchesData.filter((m)=>m.player1Id === player.id || m.player2Id === player.id).map((m)=>m.id)
                }));
            dispatch({
                type: 'INITIALIZE_DATA',
                payload: {
                    players: playersWithMatches,
                    matches: matchesData
                }
            });
        } catch (error) {
            console.error('Error loading data from API:', error);
            dispatch({
                type: 'SET_ERROR',
                payload: error.message || 'Failed to load data from backend'
            });
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadData();
    }, []);
    const reloadData = async ()=>{
        await loadData();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            state,
            reloadData
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AppContext.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
function useApp() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__efab7baf._.js.map