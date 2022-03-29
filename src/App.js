import React, { Component } from "react";
import "./App.css";

class PomodoroClock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessionLength: 1,
            breakLength: 1,
            totalTime: (1 + 1) * 60000,
            isPomoInSession: true,
            timer: "25:00",
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

            const newTotalTime =
                (state.breakLength + incrementedSessionTime) * 60000;

            return {
                sessionLength: incrementedSessionTime,
                timer:
                    incrementedSessionTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                totalTime: newTotalTime,
            };
        });
    }
    decrementSessionLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.sessionLength - 1 < 1) return;

            const decrementedSessionTime = state.sessionLength - 1;

            const newTotalTime =
                (state.breakLength + decrementedSessionTime) * 60000;

            return {
                sessionLength: decrementedSessionTime,
                timer:
                    decrementedSessionTime.toString().padStart(2, "0") + ":00",
                passedTime: 0,
                totalTime: newTotalTime,
            };
        });
    }

    incrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength + 1 > 60) return;

            const incrementedBreakTime = state.breakLength + 1;

            const newTotalTime =
                (incrementedBreakTime + state.sessionLength) * 60000;

            return {
                breakLength: incrementedBreakTime,
                passedTime: 0,
                totalTime: newTotalTime,
            };
        });
    }
    decrementBreakLength() {
        this.setState((state, props) => {
            if (state.isTimerPlaying || state.breakLength - 1 < 1) return;

            const decrementedBreakTime = state.breakLength - 1;

            const newTotalTime =
                (decrementedBreakTime + state.sessionLength) * 60000;

            return {
                breakLength: decrementedBreakTime,
                passedTime: 0,
                totalTime: newTotalTime,
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
            timer: "25:00",
            passedTime: 0,
            isTimerPlaying: false,
            isPomoInSession: true,
            totalTime: (25 + 5) * 60000,
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

        const sessionTime =
            Date.now() +
            this.state.sessionLength * 60000 -
            this.state.passedTime;
        const breakTime =
            Date.now() +
            (this.state.breakLength + this.state.sessionLength) * 60000 -
            this.state.passedTime;

        const intervalID = setInterval(() => {
            const currentTime = Date.now();
            let timeLeft = 0;
            let passedTime = 0;

            if (this.state.isPomoInSession) {
                timeLeft = sessionTime - currentTime;
                passedTime = this.state.sessionLength * 60000 - timeLeft;
            } else {
                timeLeft = breakTime - currentTime;
                passedTime =
                    (this.state.sessionLength + this.state.breakLength) *
                        60000 -
                    timeLeft;
            }

            if (timeLeft <= 0) {
                this.playAudio();
            }

            if (timeLeft <= 0 && this.state.isPomoInSession) {
                this.setState((state, props) => ({
                    isPomoInSession: false,
                }));
            }

            if (passedTime >= this.state.totalTime) {
                clearInterval(this.state.pomoIntervalID);
                this.setState({
                    passedTime: 0,
                    timer: `${"0".padStart(2, "0")}:${"0".padStart(2, "0")}`,
                    isTimerPlaying: false,
                    isPomoInSession: true,
                });
                this.playPomo();
                return;
            }

            /**
             * Stores the time that has passed since the pomo started
             */
            this.setState({
                passedTime: passedTime,
            });

            /**
             * Stores the minutes and seconds remaining until the pomo is finished.
             */
            let [minutesLeft, secondsLeft] = (timeLeft / 60000)
                .toString()
                .split(".");

            secondsLeft = (("0." + secondsLeft) * 60).toFixed(0);

            // if (secondsLeft === "60") {
            //     minutesLeft = (parseInt(minutesLeft) + 1).toString();
            //     secondsLeft = "0";
            // }

            if (minutesLeft === "-0") minutesLeft = "0";

            this.setState({
                timer: `${minutesLeft.padStart(2, "0")}:${secondsLeft.padStart(
                    2,
                    "0"
                )}`,
                isTimerPlaying: true,
            });
        }, 1000);

        this.setState({ pomoIntervalID: intervalID });
    }

    render() {
        const sessionLength = this.state.sessionLength;
        const breakLength = this.state.breakLength;
        const pomoStage = this.state.isPomoInSession;
        const timeLeft = this.state.timer;
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
                <Timer status={pomoStage} time={timeLeft} />
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
