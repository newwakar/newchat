"use strict";

const SUPABASE_URL = 'https://gtwfpadfolyqbuslphbc.supabase.co'; 
const SUPABASE_ANON = 'sb_publishable_fEptz1byMFr8sHAk-J_xkg_AKpMx65r';

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out"
};

// --- Dashboard Components ---
const WeatherReport = () => (
    React.createElement("div", { className: "weather-gadget" },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "15px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)" }},
            React.createElement("div", null,
                React.createElement("h2", { style: { margin: 0, color: "white" } }, "24°C"),
                React.createElement("p", { style: { margin: 0, color: "#7d8590" } }, "Sunny - Hyderabad")
            ),
            React.createElement("i", { className: "fa-solid fa-sun", style: { fontSize: "2rem", color: "#f1c40f" } })
        )
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

    return React.createElement("div", { style: { background: "#161b22", borderRadius: "15px", border: "1px solid #30363d", height: "400px", display: "flex", flexDirection: "column", overflow: "hidden" } },
        React.createElement("div", { style: { padding: "10px", borderBottom: "1px solid #30363d" } },
            React.createElement("input", { value: userName, onChange: e => setUserName(e.target.value), style: { background: "transparent", border: "none", color: "#9fe1cb", outline: "none", fontSize: "12px", width: "100%" } })
        ),
        React.createElement("div", { style: { flex: 1, padding: "15px", overflowY: "auto", color: "white" } },
            messages.map((m, i) => React.createElement("div", { key: i }, React.createElement("b", { style: { color: "#1d9e75" } }, m.username + ": "), m.content))
        ),
        React.createElement("div", { style: { padding: "10px", display: "flex", gap: "10px", background: "#0d1117" } },
            React.createElement("input", { value: text, onChange: e => setText(e.target.value), onKeyDown: e => e.key === "Enter" && send(), style: { flex: 1, background: "#21262d", border: "none", padding: "10px", borderRadius: "5px", color: "white" } }),
            React.createElement("button", { onClick: send, style: { background: "#1d9e75", color: "white", border: "none", padding: "0 15px", borderRadius: "5px", cursor: "pointer" } }, "SEND")
        )
    );
};

// --- Main App Logic ---
const App = () => {
    const [status, setStatus] = React.useState(UserStatus.LoggedOut);
    const [pin, setPin] = React.useState("");
    const inputRef = React.useRef(null);

    // Force focus when user tries to type
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
        return React.createElement("div", { style: { padding: "40px 20px", maxWidth: "500px", margin: "0 auto", position: "relative", zIndex: 10 } },
            React.createElement(WeatherReport, null),
            React.createElement(ChatApp, null),
            React.createElement("button", { onClick: () => { setStatus(UserStatus.LoggedOut); setPin(""); }, style: { marginTop: "20px", color: "#7d8590", background: "none", border: "none", cursor: "pointer", width: "100%" } }, "Lock Screen")
        );
    }

    return React.createElement("div", { id: "app", className: status.toLowerCase().replace(/\s/g, "-") },
        React.createElement("div", { id: "app-background", onClick: startLogin },
            React.createElement("div", { className: "background-image" })
        ),
        React.createElement("div", { id: "app-info" }, React.createElement("span", { className: "time" }, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))),
        React.createElement("div", { id: "app-pin-wrapper", style: { pointerEvents: "all" } },
            React.createElement("input", { 
                ref: inputRef,
                autoFocus: true,
                type: "number", 
                value: pin, 
                onChange: handlePin, 
                id: "app-pin-hidden-input",
                style: { position: "absolute", opacity: 0, zIndex: -1 } 
            }),
            React.createElement("div", { id: "app-pin", onClick: startLogin, style: { cursor: "text" } },
                [0, 1, 2, 3].map(i => React.createElement("div", { 
                    key: i, 
                    className: classNames("app-pin-digit", { focused: pin.length === i, hidden: pin.length > i }) 
                }, pin[i] || ""))
            ),
            React.createElement("h3", { style: { color: "white", textAlign: "center", marginTop: "20px" } }, status === UserStatus.LoggedOut ? "Click to Unlock" : "Enter PIN (1234)")
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
