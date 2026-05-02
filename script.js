"use strict";

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON = 'YOUR_ANON_KEY_HERE';

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out"
};

// --- Weather Component ---
const WeatherReport = () => (
    React.createElement("div", { className: "weather-card", style: { padding: "15px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", marginBottom: "15px", color: "white" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
            React.createElement("div", null,
                React.createElement("div", { style: { fontSize: "1.5rem", fontWeight: "bold" } }, "24°C"),
                React.createElement("div", { style: { opacity: 0.8 } }, "Sunny Skies")
            ),
            React.createElement("i", { className: "fa-solid fa-sun", style: { fontSize: "2rem", color: "#f1c40f" } })
        )
    )
);

// --- Chat Gadget ---
const ChatApp = () => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState("");
    const [myUserName, setMyUserName] = React.useState("Guest");
    const [sb, setSb] = React.useState(null);

    React.useEffect(() => {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        setSb(client);
        client.from('messages').select('*').order('created_at', { ascending: true }).limit(20)
            .then(({ data }) => data && setMessages(data));

        const channel = client.channel('public:messages').on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            payload => setMessages(prev => [...prev, payload.new])
        ).subscribe();
        return () => client.removeChannel(channel);
    }, []);

    const send = async () => {
        if (!text.trim()) return;
        await sb.from('messages').insert([{ username: myUserName, content: text, color: "#1d9e75" }]);
        setText("");
    };

    return React.createElement("div", { style: { background: "#161b22", border: "1px solid #30363d", borderRadius: "12px", display: "flex", flexDirection: "column", height: "350px", overflow: "hidden" } },
        // Header / Name Input
        React.createElement("div", { style: { padding: "10px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "10px" } },
            React.createElement("span", { style: { color: "#7d8590", fontSize: "12px" } }, "NAME:"),
            React.createElement("input", { 
                value: myUserName, onChange: e => setMyUserName(e.target.value),
                style: { background: "transparent", border: "none", color: "#9fe1cb", borderBottom: "1px solid #1d9e75", outline: "none", width: "100px" }
            })
        ),
        // Message Area
        React.createElement("div", { style: { flex: 1, padding: "10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px" } },
            messages.map((m, i) => React.createElement("div", { key: i, style: { fontSize: "14px", color: "white" } },
                React.createElement("b", { style: { color: "#1d9e75" } }, m.username + ": "), m.content
            ))
        ),
        // Input Bar
        React.createElement("div", { style: { padding: "10px", background: "#0d1117", display: "flex", gap: "8px" } },
            React.createElement("input", { 
                value: text, onChange: e => setText(e.target.value), placeholder: "Type...",
                onKeyDown: e => e.key === 'Enter' && send(),
                style: { flex: 1, background: "#21262d", border: "none", padding: "8px", borderRadius: "4px", color: "white" }
            }),
            React.createElement("button", { onClick: send, style: { background: "#1d9e75", color: "white", border: "none", padding: "0 15px", borderRadius: "4px", cursor: "pointer" } }, "SEND")
        )
    );
};

// --- Simplified App / Lockscreen ---
const App = () => {
    const [status, setStatus] = React.useState(UserStatus.LoggedOut);
    const [pin, setPin] = React.useState("");

    const handlePin = (e) => {
        const val = e.target.value;
        if (val.length <= 4) setPin(val);
        if (val === "1234") setStatus(UserStatus.LoggedIn);
    };

    if (status === UserStatus.LoggedIn) {
        return React.createElement("div", { style: { padding: "20px", position: "relative", zIndex: 100 } },
            React.createElement("h1", { style: { color: "white" } }, "Home"),
            React.createElement(WeatherReport, null),
            React.createElement(ChatApp, null),
            React.createElement("button", { onClick: () => { setStatus(UserStatus.LoggedOut); setPin(""); }, style: { marginTop: "20px", color: "white", background: "rgba(255,255,255,0.1)", border: "1px solid white", padding: "10px", borderRadius: "5px" } }, "Lock Screen")
        );
    }

    return React.createElement("div", { id: "app", className: status === UserStatus.LoggedOut ? "logged-out" : "logging-in" },
        React.createElement("div", { id: "app-background", onClick: () => setStatus(UserStatus.LoggingIn) },
            React.createElement("div", { className: "background-image" })
        ),
        React.createElement("div", { id: "app-info" }, React.createElement("span", { className: "time" }, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))),
        React.createElement("div", { id: "app-pin-wrapper" },
            React.createElement("input", { autoFocus: status === UserStatus.LoggingIn, type: "number", value: pin, onChange: handlePin, id: "app-pin-hidden-input" }),
            React.createElement("div", { id: "app-pin" },
                [0, 1, 2, 3].map(i => React.createElement("div", { key: i, className: classNames("app-pin-digit", { focused: pin.length === i, hidden: pin.length > i }) }, pin[i] || ""))
            ),
            React.createElement("h3", null, "Enter PIN (1234)")
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
