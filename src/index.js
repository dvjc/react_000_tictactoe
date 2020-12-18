import React  from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props){
    return (
        <button className="square" id={props.id} onClick={props.onClick}>
            {props.value}
        </button>
    );
}
  
class Board extends React.Component {

    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                id={"s" + i}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                    </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                    </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coordinate: '',
            }],
            stepNumber: 0,
            xIsNext: true,
        };
    }

    handleClick(i){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const fetchWinner = calculateWinner(current.squares);
        const winner = fetchWinner.winner;
        if( winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        let coordinate = this.convertPositionToCoordinate(i);
        this.setState({
            history: history.concat([{
                squares: squares,
                coordinate: coordinate
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext : (step % 2) === 0,
        });
    }

    // example: [0,1,2]
    cleanupBackgrounds(line){
        // no winner
        if ( ['null','undefined'].indexOf('' + line ) >= 0 || ((line).hasOwnProperty("length") && line.length === 0) ) {
            [0,1,2,3,4,5,6,7,8].map(position => {
                let square = document.getElementById("s" + position);
                if (square){
                    square.setAttribute("class", "square");
                }
            });
        } else {
            line.map(position => {
                let square = document.getElementById("s" + position);
                if (square){
                    square.setAttribute("class", "encolored");
                }
            });
        }
    }

    convertPositionToCoordinate(i){
        let column = i % 3;
        let row = (i - column) / 3;
        let coordinate = ` (${ row },${ column }) `;
        return coordinate;
    }

    convertCoordinateToPosition(coordinate){
        let i = -1;
        const split0 = coordinate.split("(");
        if ( split0.length > 1 ) {
            const split1 = split0[1].split(",");
            if ( split1.length > 1 ) {
                const split2 = split1[1].split(")");
                if ( split2.length > 1 ) {
                    let row = parseInt(split1[0]);
                    let column = parseInt(split2[0]);
                    if ( ('' + row) != "NaN" && ('' + column) != "NaN"){
                        i = 3 * row + column;
                    }
                }
            }
        }
        return i;
    }

    emboldenSingleSquare(index){
        [0,1,2,3,4,5,6,7,8].map(position => {
            let square = document.getElementById("s" + position);
            if (square){
                let squareStyle = (position == index) ? "boldSquare" : "square";
                square.setAttribute("class", squareStyle);
            }
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const fetchWinner = calculateWinner(current.squares);
        const winner = fetchWinner.winner;
        const isTie = this.state.history.length > 9;

        const moves = history.map((step,move) => {
            const coordinate = step.coordinate;
            const desc = move ?
                'Go to move #' + move + coordinate :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        let line = winner ? fetchWinner.line : null;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (isTie) {
            status = 'Draw: No Winner!';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        this.cleanupBackgrounds(line);

        if (!winner){
            let coordinate = current.coordinate;
            let i = this.convertCoordinateToPosition(coordinate);
            this.emboldenSingleSquare(i);
        }        

        return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    onClick={(i) => this.handleClick(i)}
                />
            </div>
            <div className="game-info">
            <div>{status}</div>
            <ol>{moves}</ol>
            </div>
        </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(
<Game />,
document.getElementById('root')
);

function calculateWinner(squares){
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++){
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i]
            }
        }
    }
    return {
        winner: null,
        line: []
    };
}
  