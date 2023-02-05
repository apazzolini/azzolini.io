import { useEffect, useReducer } from 'preact/compat';
import GameReducer, { createInitialState, calculateNextMove, canAct, Dispatch, GameState } from './reducer';

const PIECES = {
  FACING_RIGHT: '>',
  FACING_LEFT: '<',
  BLANK: ' ',
} as const;

function GamePiece({
  pieceIdx,
  state,
  dispatch,
}: {
  pieceIdx: number;
  state: GameState;
  dispatch: Dispatch;
}) {
  function handleClick() {
    dispatch({ kind: 'MOVE', pieceIdx });
  }

  const piece = state.board[pieceIdx];
  const clickable = !state.isWinningState && !state.isAutosolving && canAct(state.board, pieceIdx);

  return (
    <div
      className={`
        font-black text-2xl rounded-sm mx-1
        border border-zinc-600 w-14 h-16 flex items-center justify-center
        ${!state.isWinningState && state.lastMoveIdx === pieceIdx && '!border-zinc-200'}
        ${state.isWinningState && piece !== 'BLANK' && '!border-accent-3'}
        ${clickable && 'cursor-pointer hover:border-rose-400'}
        ${piece === 'FACING_LEFT' ? 'text-accent-1' : 'text-accent-2'}
      `}
      onClick={clickable ? handleClick : () => {}}
    >
      {PIECES[piece]}
    </div>
  );
}

function Board({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  return (
    <div className="flex flex-row mt-8 justify-center">
      {state.board.map((p, idx) => (
        <GamePiece key={idx} pieceIdx={idx} state={state} dispatch={dispatch} />
      ))}
    </div>
  );
}

export default function Game({ numPlayers }: { numPlayers: number }) {
  const [state, dispatch] = useReducer(GameReducer, createInitialState(numPlayers));

  useEffect(() => {
    let active = true;

    if (state.isAutosolving) {
      new Promise((resolve) => setTimeout(resolve, 250)).then(() => {
        if (active) {
          dispatch(calculateNextMove(state));
        }
      });
    }

    return () => {
      active = false;
    };
  }, [state]);

  return (
    <div className="mb-10 mt-12">
      <Board state={state} dispatch={dispatch} />
      <div className="flex flex-row justify-center mt-8">
        <GameButton onClick={() => dispatch({ kind: 'RESET', numPlayers })}>Reset</GameButton>
        <GameButton onClick={() => dispatch({ kind: 'START_AUTOSOLVE', numPlayers })}>Solve</GameButton>
      </div>
    </div>
  );
}

function GameButton(props: any) {
  return (
    <button
      type="button"
      className={`
        border border-zinc-600 rounded-sm py-2 px-2 mx-2 bg-zinc-800 font-mono font-medium
        hover:bg-rose-700 hover:border-rose-700
      `}
      {...props}
    />
  );
}
