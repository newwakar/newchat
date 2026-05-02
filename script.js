"use strict";

const UserStatus = {
    LoggedIn: "Logged In",
    LoggingIn: "Logging In",
    LoggedOut: "Logged Out",
    LogInError: "Log In Error",
    VerifyingLogIn: "Verifying Log In"
};

// --- Utilities ---
const T = {
    format: (date) => {
        const hours = date.getHours() % 12 || 12;
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        return `${hours}:${minutes}`;
    }
};

const LogInUtility = {
    verify: async (pin) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (pin === "1234") resolve(true);
                else reject("Invalid PIN");
            }, 500);
        });
    }
};

// --- Components ---
const Time = () => {
    const [date, setDate] = React.useState(new Date());
    React.useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return React.createElement("span", { className: "time" }, T.format(date));
};

const PinDigit = ({ value, focused }) => {
    const [hidden, setHidden] = React.useState(false);
    React.useEffect(() => {
        if (value) {
            const timeout = setTimeout(() => setHidden(true), 500);
            return () => { setHidden(false); clearTimeout(timeout); };
        }
    }, [value]);

    return React.createElement("div", { 
        className: classNames("app-pin-digit", { focused, hidden }) 
    }, React.createElement("span", { className: "app-pin-digit-value" }, value || ""));
};

const Pin = () => {
    const { userStatus, setUserStatusTo } = React.useContext(AppContext);
    const [pin, setPin] = React.useState("");
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (userStatus === UserStatus.LoggingIn || userStatus === UserStatus.LogInError) {
            inputRef.current.focus();
        } else {
            setPin("");
        }
    }, [userStatus]);

    const handleOnChange = (e) => {
        const val = e.target.value;
        if (val.length <= 4) setPin(val);
        if (val.length === 4) {
            setUserStatusTo(UserStatus.VerifyingLogIn);
            LogInUtility.verify(val)
                .then(() => setUserStatusTo(UserStatus.LoggedIn))
                .catch(() => setUserStatusTo(UserStatus.LogInError));
        }
    };

    return React.createElement("div", { id: "app-pin-wrapper" },
        React.createElement("input", { 
            id: "app-pin-hidden-input", type: "number", 
            ref: inputRef, value: pin, onChange: handleOnChange 
        }),
        React.createElement("div", { id: "app-pin", onClick: () => inputRef.current.focus() },
            [0, 1, 2, 3].map(i => React.createElement(PinDigit, { 
                key: i, focused: pin.length === i, value: pin[i] 
            }))
        ),
        React.createElement("h3", { id: "app-pin-label" }, "Enter PIN (1234)")
    );
};

const AppContext = React.createContext(null);

const App = () => {
    const [userStatus, setUserStatusTo] = React.useState(UserStatus.LoggedOut);

    return React.createElement(AppContext.Provider, { value: { userStatus, setUserStatusTo } },
        React.createElement("div", { id: "app", className: userStatus.replace(/\s+/g, "-").toLowerCase() },
            // Time display on lockscreen
            React.createElement("div", { id: "app-info" }, React.createElement(Time, null)),
            
            // Login PIN UI
            React.createElement(Pin, null),
            
            // Background screen[cite: 2, 3]
            React.createElement("div", { 
                id: "app-background", 
                onClick: () => userStatus === UserStatus.LoggedOut && setUserStatusTo(UserStatus.LoggingIn) 
            }, React.createElement("div", { id: "app-background-image", className: "background-image" })),
            
            // Sign in Button
            userStatus === UserStatus.LoggedOut && React.createElement("div", { id: "sign-in-button-wrapper" },
                React.createElement("button", { 
                    className: "user-status-button clear-button",
                    onClick: () => setUserStatusTo(UserStatus.LoggingIn)
                }, React.createElement("i", { className: "fa-solid fa-arrow-right-to-arc" }))
            ),

            // Success message when logged in
            userStatus === UserStatus.LoggedIn && React.createElement("div", { 
                style: { position: "relative", zIndex: 10, color: "white", textAlign: "center", paddingTop: "20vh" } 
            }, 
                React.createElement("h1", null, "Unlocked!"),
                React.createElement("button", { 
                    className: "clear-button", style: { color: "white", padding: "10px 20px", marginTop: "20px" },
                    onClick: () => setUserStatusTo(UserStatus.LoggedOut)
                }, "Lock Screen")
            )
        )
    );
};

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
