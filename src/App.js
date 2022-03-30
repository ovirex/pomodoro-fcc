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
            };
        });
    }

    incrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength + 1 > 60) return;

            const incrementedBreakTime = state.breakLength + 1;

            return {
                breakLength: incrementedBreakTime,
                passedTime: 0,
            };
        });
    }
    decrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength - 1 < 1) return;

            const decrementedBreakTime = state.breakLength - 1;

            return {
                breakLength: decrementedBreakTime,
                passedTime: 0,
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
        }, 1000);

        this.setState({ pomoIntervalID: intervalID });
    }

    render() {
        const sessionLength = this.state.sessionLength;
        const breakLength = this.state.breakLength;
        const pomoStatus = this.state.isPomoInSession;
        const timeLeft = this.state.timeLeft;
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
                <Timer status={pomoStatus} time={timeLeft} />
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
    return (
        <div className="pomodoro-settings">
            <div>
                <p id="break-label">Break Length</p>
                <button
                    id="break-decrement"
                    title="decrement break time"
                    onClick={props.decrementBreak}
                >
                    <i className="fa fa-arrow-down" aria-hidden="true"></i>
                </button>
                <div id="break-length">{props.break}</div>
                <button
                    id="break-increment"
                    title="increment break time"
                    onClick={props.incrementBreak}
                >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i>
                </button>
            </div>
            <div>
                <p id="session-label">Session Length</p>
                <button
                    id="session-decrement"
                    title="decrement session time"
                    onClick={props.decrementSession}
                >
                    <i className="fa fa-arrow-down" aria-hidden="true"></i>
                </button>
                <div id="session-length">{props.session}</div>
                <button
                    id="session-increment"
                    title="increment session time"
                    onClick={props.incrementSession}
                >
                    <i className="fa fa-arrow-up" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    );
}

function Timer(props) {
    return (
        <div>
            <p id="timer-label">{props.status ? "Session" : "Break"}</p>
            <div id="time-left">{props.time}</div>
        </div>
    );
}

function PomoControllers(props) {
    return (
        <div>
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
