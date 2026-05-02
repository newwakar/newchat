"use strict";

const SUPABASE_URL = 'https://gtwfpadfolyqbuslphbc.supabase.co'; 
const SUPABASE_ANON = 'sb_publishable_fEptz1byMFr8sHAk-J_xkg_AKpMx65r';

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out"
};

// --- Dashboard Gadget: Weather ---
const WeatherReport = () => (
    React.createElement("div", { 
        style: { 
            padding: "20px", background: "rgba(255,255,255,0.05)", 
            borderRadius: "15px", marginBottom: "20px", display: "flex", 
            justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)" 
        } 
    },
        React.createElement("div", null,
            React.createElement("div", { style: { fontSize: "2rem", fontWeight: "700", color: "#e6edf3" } }, "24°C"),
            React.createElement("div", { style: { color: "#7d8590", fontFamily: "DM Sans" } }, "Hyderabad, India")
        ),
        React.createElement("i", { className: "fa-solid fa-bolt-lightning", style: { fontSize: "2rem", color: "#f1c40f" } })
    )
);

// --- Dashboard Gadget: Supabase Chat ---
const ChatApp = () => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState("");
    const [userName, setUserName] = React.useState("Guest");
    const [sb, setSb] = React.useState(null);

    React.useEffect(() => {
        if (SUPABASE_URL.includes("YOUR_PROJECT_ID")) return;
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        setSb(client);
        
        client.from('messages').select('*').order('created_at', { ascending: true }).limit(25)
            .then(({ data }) => data && setMessages(data));

        const channel = client.channel('room1').on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            payload => setMessages(prev => [...prev, payload.new])
        ).subscribe();

        return () => client.removeChannel(channel);
    }, []);

    const sendMessage = async () => {
        if (!text.trim() || !sb) return;
        await sb.from('messages').insert([{ username: userName, content: text, color: "#1d9e75" }]);
        setText("");
    };

    return React.createElement("div", { 
        style: { 
            background: "#161b22", borderRadius: "15px", border: "1px solid #30363d", 
            display: "flex", flexDirection: "column", height: "450px", overflow: "hidden" 
        } 
    },
        // Chat Header
        React.createElement("div", { style: { padding: "15px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: "10px" } },
            React.createElement("span", { style: { color: "#7d8590", fontSize: "11px", fontWeight: "bold", fontFamily: "Space Mono" } }, "USER:"),
            React.createElement("input", { 
                value: userName, onChange: e => setUserName(e.target.value),
                style: { background: "transparent", border: "none", color: "#9fe1cb", borderBottom: "1px solid #1d9e75", outline: "none", width: "120px" }
            })
        ),
        // Messages
        React.createElement("div", { style: { flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" } },
            messages.map((m, i) => React.createElement("div", { key: i, style: { fontSize: "14px", color: "#e6edf3" } },
                React.createElement("b", { style: { color: m.color || "#1d9e75", fontFamily: "Space Mono" } }, m.username + ": "),
                React.createElement("span", { style: { fontFamily: "DM Sans" } }, m.content)
            ))
        ),
        // Input Footer
        React.createElement("div", { style: { padding: "15px", background: "#0d1117", display: "flex", gap: "10px" } },
            React.createElement("input", { 
                value: text, onChange: e => setText(e.target.value),
                onKeyDown: e => e.key === "Enter" && sendMessage(),
                placeholder: "Type message...",
                style: { flex: 1, background: "#21262d", border: "1px solid #30363d", borderRadius: "8px", padding: "10px", color: "white", outline: "none" }
            }),
            React.createElement("button", { 
                onClick: sendMessage,
                style: { background: "#1d9e75", color: "white", border: "none", padding: "0 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
            }, "SEND")
        )
    );
};

// --- Main Application Wrapper ---
const App = () => {
    const [status, setStatus] = React.useState(UserStatus.LoggedOut);
    const [pin, setPin] = React.useState("");

    const onPinChange = (e) => {
        const val = e.target.value;
        if (val.length <= 4) setPin(val);
        if (val === "1234") setStatus(UserStatus.LoggedIn);
    };

    // View 1: The Logged In Dashboard
    if (status === UserStatus.LoggedIn) {
        return React.createElement("div", { id: "dashboard", style: { minHeight: "100vh", width: "100%", position: "relative", zIndex: 10, padding: "40px 20px", boxSizing: "border-box" } },
            React.createElement("div", { style: { maxWidth: "600px", margin: "0 auto" } },
                React.createElement(WeatherReport, null),
                React.createElement(ChatApp, null),
                React.createElement("button", { 
                    onClick: () => { setStatus(UserStatus.LoggedOut); setPin(""); },
                    style: { marginTop: "20px", width: "100%", background: "transparent", border: "1px solid #30363d", color: "#7d8590", padding: "10px", borderRadius: "8px", cursor: "pointer" }
                }, "Exit to Lock Screen")
            )
        );
    }

    // View 2: The Lock Screen
    return React.createElement("div", { 
        id: "app", 
        className: status === UserStatus.LoggedOut ? "logged-out" : "logging-in",
        style: { height: "100vh", width: "100vw", overflow: "hidden" }
    },
        React.createElement("div", { id: "app-background", onClick: () => setStatus(UserStatus.LoggingIn) },
            React.createElement("div", { className: "background-image" })
        ),
        React.createElement("div", { id: "app-info" }, 
            React.createElement("span", { className: "time" }, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        ),
        React.createElement("div", { id: "app-pin-wrapper" },
            React.createElement("input", { 
                autoFocus: status === UserStatus.LoggingIn,
                id: "app-pin-hidden-input", type: "number", value: pin, onChange: onPinChange 
            }),
            React.createElement("div", { id: "app-pin", onClick: () => setStatus(UserStatus.LoggingIn) },
                [0, 1, 2, 3].map(i => React.createElement("div", { 
                    key: i, 
                    className: classNames("app-pin-digit", { focused: pin.length === i, hidden: pin.length > i }) 
                }, pin[i] || ""))
            ),
            React.createElement("h3", { style: { color: "white", fontFamily: "DM Sans" } }, "Enter PIN (1234)")
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
