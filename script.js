"use strict";

const SUPABASE_URL = 'https://gtwfpadfolyqbuslphbc.supabase.co'; 
const SUPABASE_ANON = 'sb_publishable_fEptz1byMFr8sHAk-J_xkg_AKpMx65r';

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out"
};

// --- New Component: Stylish Date & Time ---
const DateDisplay = () => {
    const [now, setNow] = React.useState(new Date());
    
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', month: 'long', day: 'numeric' 
    });

    return React.createElement("div", { style: { marginBottom: "25px", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: "3.5rem", fontWeight: "700", color: "white", letterSpacing: "-2px", lineHeight: "1" } }, 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ),
        React.createElement("div", { style: { fontSize: "1rem", color: "#1d9e75", textTransform: "uppercase", letterSpacing: "2px", marginTop: "5px", fontWeight: "bold" } }, 
            dateStr
        )
    );
};

// --- Dashboard Components ---
const WeatherReport = () => (
    React.createElement("div", { style: { padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)" }},
        React.createElement("div", null,
            React.createElement("div", { style: { fontSize: "1.8rem", fontWeight: "700", color: "white" } }, "24°C"),
            React.createElement("div", { style: { color: "#7d8590", fontSize: "0.9rem" } }, "Hyderabad, India")
        ),
        React.createElement("i", { className: "fa-solid fa-cloud-sun", style: { fontSize: "2rem", color: "#f1c40f" } })
    )
);

const ChatApp = () => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState("");
    const [userName, setUserName] = React.useState("Guest");
    const [sb, setSb] = React.useState(null);

    React.useEffect(() => {
        if (SUPABASE_URL.includes("YOUR_PROJECT_ID")) return;
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        setSb(client);
        client.from('messages').select('*').order('created_at', { ascending: true }).limit(20)
            .then(({ data }) => data && setMessages(data));

        const channel = client.channel('room1').on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            payload => setMessages(prev => [...prev, payload.new])
        ).subscribe();
        return () => client.removeChannel(channel);
    }, []);

    const send = async () => {
        if (!text.trim() || !sb) return;
        await sb.from('messages').insert([{ username: userName, content: text, color: "#1d9e75" }]);
        setText("");
    };

    return React.createElement("div", { style: { background: "#161b22", borderRadius: "15px", border: "1px solid #30363d", height: "400px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" } },
        React.createElement("div", { style: { padding: "12px 15px", borderBottom: "1px solid #30363d", background: "#0d1117", display: "flex", alignItems: "center", gap: "10px" } },
            React.createElement("span", { style: { color: "#7d8590", fontSize: "11px", fontWeight: "bold" } }, "CHAT AS:"),
            React.createElement("input", { value: userName, onChange: e => setUserName(e.target.value), style: { background: "transparent", border: "none", color: "#9fe1cb", outline: "none", fontSize: "12px", borderBottom: "1px solid #1d9e75" } })
        ),
        React.createElement("div", { style: { flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" } },
            messages.map((m, i) => React.createElement("div", { key: i, style: { fontSize: "14px", color: "#e6edf3" } },
                React.createElement("b", { style: { color: "#1d9e75" } }, m.username + ": "), m.content
            ))
        ),
        React.createElement("div", { style: { padding: "12px", display: "flex", gap: "10px", background: "#0d1117" } },
            React.createElement("input", { value: text, onChange: e => setText(e.target.value), onKeyDown: e => e.key === "Enter" && send(), placeholder: "Message...", style: { flex: 1, background: "#21262d", border: "none", padding: "10px", borderRadius: "8px", color: "white" } }),
            React.createElement("button", { onClick: send, style: { background: "#1d9e75", color: "white", border: "none", padding: "0 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" } }, "SEND")
        )
    );
};

// --- Main App Logic ---
const App = () => {
    const [status, setStatus] = React.useState(UserStatus.LoggedOut);
    const [pin, setPin] = React.useState("");
    const inputRef = React.useRef(null);

    const startLogin = () => {
        setStatus(UserStatus.LoggingIn);
        setTimeout(() => { if(inputRef.current) inputRef.current.focus(); }, 100);
    };

    const handlePin = (e) => {
        const val = e.target.value;
        if (val.length <= 4) setPin(val);
        if (val === "1234") setStatus(UserStatus.LoggedIn);
    };

    if (status === UserStatus.LoggedIn) {
        return React.createElement("div", { style: { padding: "30px 20px", maxWidth: "500px", margin: "0 auto", position: "relative", zIndex: 10 } },
            // Header with Logout
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" } },
                React.createElement("h2", { style: { color: "white", margin: 0, fontFamily: "DM Sans" } }, "Dashboard"),
                React.createElement("button", { 
                    onClick: () => { setStatus(UserStatus.LoggedOut); setPin(""); },
                    style: { background: "#ef4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }
                }, "LOGOUT")
            ),
            React.createElement(DateDisplay, null),
            React.createElement(WeatherReport, null),
            React.createElement(ChatApp, null)
        );
    }

    return React.createElement("div", { id: "app", className: status.toLowerCase().replace(/\s/g, "-") },
        React.createElement("div", { id: "app-background", onClick: startLogin },
            React.createElement("div", { className: "background-image" })
        ),
        React.createElement("div", { id: "app-info" }, React.createElement("span", { className: "time" }, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))),
        React.createElement("div", { id: "app-pin-wrapper" },
            React.createElement("input", { 
                ref: inputRef, autoFocus: true, type: "number", value: pin, onChange: handlePin, id: "app-pin-hidden-input" 
            }),
            React.createElement("div", { id: "app-pin", onClick: startLogin },
                [0, 1, 2, 3].map(i => React.createElement("div", { 
                    key: i, className: classNames("app-pin-digit", { focused: pin.length === i, hidden: pin.length > i }) 
                }, pin[i] || ""))
            ),
            React.createElement("h3", { style: { color: "white", textAlign: "center", marginTop: "20px" } }, 
                status === UserStatus.LoggedOut ? "Click to Unlock" : "Enter PIN (1234)"
            )
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
