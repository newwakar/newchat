"use strict";

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out",
    LogInError: "Log In Error",
    VerifyingLogIn: "Verifying Log In"
};

// --- Supabase Config (ADD YOUR KEYS HERE) ---
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON = 'YOUR_ANON_KEY_HERE';

// --- Weather Gadget Component ---
const WeatherReport = () => {
    return React.createElement("div", { className: "weather-gadget", style: { padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "15px", marginBottom: "20px" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("div", null,
                React.createElement("h2", { style: { margin: 0, fontSize: "2rem" } }, "24°C"),
                React.createElement("p", { style: { margin: 0, opacity: 0.7 } }, "Partly Cloudy")
            ),
            React.createElement("i", { className: "fa-solid fa-cloud-sun", style: { fontSize: "3rem", color: "#f39c12" } })
        ),
        React.createElement("p", { style: { fontSize: "0.8rem", marginTop: "10px", opacity: 0.5 } }, "Hyderabad, India")
    );
};

// --- Supabase Chat Component ---
const ChatApp = () => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState("");
    const [sb, setSb] = React.useState(null);

    React.useEffect(() => {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        setSb(client);

        // Fetch History
        client.from('messages').select('*').order('created_at', { ascending: true }).limit(50)
            .then(({ data }) => data && setMessages(data));

        // Realtime Subscription
        const channel = client.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                setMessages(prev => [...prev, payload.new]);
            }).subscribe();

        return () => client.removeChannel(channel);
    }, []);

    const send = async () => {
        if (!text.trim()) return;
        await sb.from('messages').insert([{ username: "Guest", content: text, color: "#1d9e75" }]);
        setText("");
    };

    return React.createElement("div", { className: "chat-gadget", style: { background: "#0d1117", borderRadius: "15px", padding: "15px", border: "1px solid rgba(255,255,255,0.1)" } },
        React.createElement("h3", { style: { fontFamily: 'Space Mono', color: "#9fe1cb", marginBottom: "10px" } }, "#open-chat"),
        React.createElement("div", { style: { height: "200px", overflowY: "auto", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "8px" } },
            messages.map((m, i) => React.createElement("div", { key: i, style: { fontSize: "13px" } },
                React.createElement("b", { style: { color: m.color || "#fff" } }, m.username + ": "),
                React.createElement("span", { style: { color: "#e6edf3" } }, m.content)
            ))
        ),
        React.createElement("div", { style: { display: "flex", gap: "5px" } },
            React.createElement("input", { 
                value: text, onChange: e => setText(e.target.value), 
                placeholder: "Say something...",
                style: { flex: 1, background: "#21262d", border: "none", borderRadius: "5px", padding: "8px", color: "white" } 
            }),
            React.createElement("button", { onClick: send, style: { background: "#1d9e75", border: "none", borderRadius: "5px", padding: "0 15px", color: "white" } }, "→")
        )
    );
};

// --- Lockscreen Core ---
const Time = () => {
    const [date, setDate] = React.useState(new Date());
    React.useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return React.createElement("span", { className: "time" }, date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
};

const Pin = ({ status, setStatus }) => {
    const [pin, setPin] = React.useState("");
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (status === UserStatus.LoggingIn) inputRef.current.focus();
    }, [status]);

    const handleInput = (e) => {
        const val = e.target.value;
        if (val.length <= 4) setPin(val);
        if (val === "1234") setStatus(UserStatus.LoggedIn);
    };

    return React.createElement("div", { id: "app-pin-wrapper" },
        React.createElement("input", { ref: inputRef, type: "number", value: pin, onChange: handleInput, id: "app-pin-hidden-input" }),
        React.createElement("div", { id: "app-pin", onClick: () => inputRef.current.focus() },
            [0, 1, 2, 3].map(i => React.createElement("div", { key: i, className: classNames("app-pin-digit", { focused: pin.length === i, hidden: pin.length > i }) }, pin[i] || ""))
        ),
        React.createElement("h3", null, "Enter PIN (1234)")
    );
};

const App = () => {
    const [userStatus, setUserStatusTo] = React.useState(UserStatus.LoggedOut);

    return React.createElement("div", { id: "app", className: userStatus.toLowerCase().replace(/\s/g, "-") },
        userStatus !== UserStatus.LoggedIn ? [
            React.createElement("div", { key: "info", id: "app-info" }, React.createElement(Time, null)),
            React.createElement(Pin, { key: "pin", status: userStatus, setStatus: setUserStatusTo }),
            React.createElement("div", { key: "bg", id: "app-background", onClick: () => setUserStatusTo(UserStatus.LoggingIn) })
        ] : React.createElement("div", { style: { padding: "40px", color: "white", zIndex: 10, position: "relative" } },
            React.createElement("h1", null, "Welcome back"),
            React.createElement(WeatherReport, null),
            React.createElement(ChatApp, null),
            React.createElement("button", { 
                onClick: () => setUserStatusTo(UserStatus.LoggedOut),
                style: { marginTop: "20px", background: "none", border: "1px solid white", color: "white", padding: "10px", borderRadius: "5px", cursor: "pointer" }
            }, "Lock Screen")
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
