import React, { Component } from "react";
import "./App.css";

class PomodoroClock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessionLength: 25,
            breakLength: 5,
            isPomoInSession: true,
            timer: 1500,
            timeLeft: "25:00",
            isTimerPlaying: false,
            pomoIntervalID: 0,
            passedTime: 0,
            isPomoAboutToEnd: false,
        };

        this.beepAudio = React.createRef();

        this.incrementSessionLength = this.incrementSessionLength.bind(this);
        this.decrementSessionLength = this.decrementSessionLength.bind(this);
        this.incrementBreakLength = this.incrementBreakLength.bind(this);
        this.decrementBreakLength = this.decrementBreakLength.bind(this);
        this.resetPomoValues = this.resetPomoValues.bind(this);
        this.playPomo = this.playPomo.bind(this);
        this.playAudio = this.playAudio.bind(this);
    }

    componentWillUnmount() {
        clearInterval(this.state.pomoIntervalID);
    }

    incrementSessionLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.sessionLength + 1 > 60) return;

            const incrementedSessionTime = state.sessionLength + 1;

            return {
                sessionLength: incrementedSessionTime,
                timeLeft:
                    incrementedSessionTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                timer: incrementedSessionTime * 60,
                isPomoAboutToEnd: false,
            };
        });
    }
    decrementSessionLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.sessionLength - 1 < 1) return;

            const decrementedSessionTime = state.sessionLength - 1;

            return {
                sessionLength: decrementedSessionTime,
                timeLeft:
                    decrementedSessionTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                timer: decrementedSessionTime * 60,
                isPomoAboutToEnd: false,
            };
        });
    }

    incrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength + 1 > 60) return;

            const incrementedBreakTime = state.breakLength + 1;

            return {
                breakLength: incrementedBreakTime,
                timeLeft:
                    incrementedBreakTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                timer: incrementedBreakTime * 60,
                isPomoAboutToEnd: false,
            };
        });
    }
    decrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength - 1 < 1) return;

            const decrementedBreakTime = state.breakLength - 1;

            return {
                breakLength: decrementedBreakTime,
                timeLeft:
                    decrementedBreakTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                timer: decrementedBreakTime * 60,
                isPomoAboutToEnd: false,
            };
        });
    }

    resetPomoValues() {
        clearInterval(this.state.pomoIntervalID);
        this.beepAudio.current.pause();
        this.beepAudio.current.currentTime = 0;
        this.setState({
            sessionLength: 25,
            breakLength: 5,
            timeLeft: "25:00",
            timer: 1500,
            passedTime: 0,
            isTimerPlaying: false,
            isPomoInSession: true,
            isPomoAboutToEnd: false,
        });
    }

    playAudio() {
        this.beepAudio.current.play();
    }

    playPomo() {
        if (this.state.isTimerPlaying) {
            clearInterval(this.state.pomoIntervalID);
            this.setState({ isTimerPlaying: false });
            return;
        }

        const intervalID = setInterval(() => {
            this.setState((state, props) => ({
                timer: state.timer - 1,
                passedTime: state.passedTime + 1,
            }));

            let timer = this.state.timer;
            let timeLeft = timer / 60;

            if (timer <= 61) {
                this.setState({ isPomoAboutToEnd: true });
            } else {
                this.setState({ isPomoAboutToEnd: false });
            }

            if (timer === 0) {
                this.playAudio();
                let newTimer = 0;
                if (this.state.isPomoInSession) {
                    newTimer = this.state.breakLength * 60 + 1;
                } else {
                    newTimer = this.state.sessionLength * 60 + 1;
                }

                this.setState((state, props) => ({
                    isPomoInSession: !state.isPomoInSession,
                    timer: newTimer,
                    passedTime: 0,
                }));
            }

            let [minutesLeft, secondsLeft] = timeLeft.toString().split(".");

            if (!secondsLeft) {
                secondsLeft = "0";
            } else {
                secondsLeft = (("0." + secondsLeft) * 60).toFixed(0);
            }

            if (minutesLeft === "-0") minutesLeft = "0";

            this.setState({
                timeLeft: `${minutesLeft.padStart(
                    2,
                    "0"
                )}:${secondsLeft.padStart(2, "0")}`,
                isTimerPlaying: true,
            });
        }, 100);

        this.setState({ pomoIntervalID: intervalID });
    }

    render() {
        const sessionLength = this.state.sessionLength;
        const breakLength = this.state.breakLength;
        const pomoStatus = this.state.isPomoInSession;
        const timeLeft = this.state.timeLeft;
        const isPomoAboutToEnd = this.state.isPomoAboutToEnd;
        return (
            <div className="App">
                <h1>Pomodoro Clock</h1>
                <PomodoroSetting
                    session={sessionLength}
                    break={breakLength}
                    incrementSession={this.incrementSessionLength}
                    decrementSession={this.decrementSessionLength}
                    incrementBreak={this.incrementBreakLength}
                    decrementBreak={this.decrementBreakLength}
                />
                <Timer
                    status={pomoStatus}
                    time={timeLeft}
                    isEnding={isPomoAboutToEnd}
                />
                <PomoControllers
                    play={this.playPomo}
                    reset={this.resetPomoValues}
                />
                <PomoAudio ref={this.beepAudio} play={this.playAudio} />
            </div>
        );
    }
}

function PomodoroSetting(props) {
    function addIncrementAnimation(e) {
        if (e.type === "mouseenter") {
            e.target.classList.add("increment-btn-animation");
            return;
        }
        e.target.classList.remove("increment-btn-animation");
    }
    function addDecrementAnimation(e) {
        if (e.type === "mouseenter") {
            e.target.classList.add("decrement-btn-animation");
            return;
        }
        e.target.classList.remove("decrement-btn-animation");
    }

    return (
        <div className="pomodoro-settings">
            <div className="setting-wrapper">
                <p id="break-label">Break Length</p>
                <div className="setting-button">
                    <button
                        id="break-decrement"
                        title="decrement break time"
                        onClick={props.decrementBreak}
                        className="decrement-btn"
                        onMouseLeave={addDecrementAnimation}
                        onMouseEnter={addDecrementAnimation}
                    >
                        <i className="fa fa-arrow-down" aria-hidden="true"></i>
                    </button>
                    <div id="break-length" className="setting-length">
                        {props.break}
                    </div>
                    <button
                        id="break-increment"
                        title="increment break time"
                        onClick={props.incrementBreak}
                        onMouseLeave={addIncrementAnimation}
                        onMouseEnter={addIncrementAnimation}
                    >
                        <i className="fa fa-arrow-up" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div className="setting-wrapper">
                <p id="session-label">Session Length</p>
                <div className="setting-button">
                    <button
                        id="session-decrement"
                        title="decrement session time"
                        onClick={props.decrementSession}
                        className="decrement-btn"
                        onMouseLeave={addDecrementAnimation}
                        onMouseEnter={addDecrementAnimation}
                    >
                        <i className="fa fa-arrow-down" aria-hidden="true"></i>
                    </button>
                    <div id="session-length" className="setting-length">
                        {props.session}
                    </div>
                    <button
                        id="session-increment"
                        title="increment session time"
                        onClick={props.incrementSession}
                        onMouseLeave={addIncrementAnimation}
                        onMouseEnter={addIncrementAnimation}
                    >
                        <i className="fa fa-arrow-up" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

function Timer(props) {
    return (
        <div
            className={`timer-wrapper ${props.isEnding ? "timer-to-end" : ""}`}
        >
            <p id="timer-label">{props.status ? "Session" : "Break"}</p>
            <div id="time-left">{props.time}</div>
        </div>
    );
}

function PomoControllers(props) {
    return (
        <div className="controllers-wrapper">
            <button id="start_stop" onClick={props.play}>
                <i className="fa fa-play" aria-hidden="true"></i>
                <i className="fa fa-pause" aria-hidden="true"></i>
            </button>
            <button id="reset" onClick={props.reset}>
                <i className="fa fa-refresh" aria-hidden="true"></i>
            </button>
        </div>
    );
}

const PomoAudio = React.forwardRef((props, ref) => {
    return (
        <div>
            <audio
                id="beep"
                ref={ref}
                preload="auto"
                src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
            ></audio>
        </div>
    );
});

export default PomodoroClock;
