export type Piece = 'FACING_LEFT' | 'BLANK' | 'FACING_RIGHT';
export type Board = Piece[];

type AutosolveState = {
  numPerSide: number;
  movesPerPass: number;
  fullPasses: number;
  curDir: number;
  curIdx: number;
  successfulMoves: number;
};

export type GameState = {
  board: Board;
  lastMoveIdx: number;
  autosolveState: Maybe<AutosolveState>;
  isAutosolving: boolean;
  isWinningState: boolean;
};

export type Action =
  | { kind: 'RESET'; numPlayers: number }
  | { kind: 'MOVE'; pieceIdx: number; autosolveState?: Maybe<AutosolveState> }
  | { kind: 'START_AUTOSOLVE'; numPlayers: number }
  | { kind: 'FINISH_AUTOSOLVE' };

export function createInitialState(numPlayers: number): GameState {
  if (numPlayers % 2 !== 0) {
    throw new Error('numPlayers must be even');
  }

  const numPerSide = numPlayers / 2;
  return {
    board: [
      ...new Array(numPerSide).fill('FACING_RIGHT'),
      'BLANK',
      ...new Array(numPerSide).fill('FACING_LEFT'),
    ] as Board,
    lastMoveIdx: -1,
    autosolveState: null,
    isAutosolving: false,
    isWinningState: false,
  };
}

export function calculateNextMove(state: GameState): Action {
  if (hasWon(state.board)) {
    return { kind: 'FINISH_AUTOSOLVE' };
  }

  const autosolveState = state.autosolveState
    ? { ...state.autosolveState }
    : {
        numPerSide: (state.board.length - 1) / 2,
        movesPerPass: 1,
        fullPasses: 0,
        curDir: -1,
        curIdx: (state.board.length - 1) / 2,
        successfulMoves: 0,
      };

  while (true) {
    if (autosolveState.successfulMoves >= autosolveState.movesPerPass) {
      autosolveState.successfulMoves = 0;

      if (autosolveState.movesPerPass === autosolveState.numPerSide) {
        autosolveState.fullPasses++;
      }

      if (autosolveState.fullPasses === 0) {
        autosolveState.movesPerPass++;
      } else if (autosolveState.fullPasses > 2) {
        autosolveState.movesPerPass--;
      }

      autosolveState.curDir *= -1;
    } else {
      autosolveState.curIdx += autosolveState.curDir;

      if (canAct(state.board, autosolveState.curIdx)) {
        autosolveState.successfulMoves++;
        return { kind: 'MOVE', pieceIdx: autosolveState.curIdx, autosolveState };
      }
    }
  }
}

function hasWon(board: Board): boolean {
  const numPerSide = (board.length - 1) / 2;
  const winningState = [
    ...new Array(numPerSide).fill('FACING_LEFT'),
    'BLANK',
    ...new Array(numPerSide).fill('FACING_RIGHT'),
  ];
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== winningState[i]) {
      return false;
    }
  }
  return true;
}

function fwdIdx(board: Board, pieceIdx: number) {
  return board[pieceIdx] === 'FACING_RIGHT' ? pieceIdx + 1 : pieceIdx - 1;
}

function jumpIdx(board: Board, pieceIdx: number) {
  return board[pieceIdx] === 'FACING_RIGHT' ? pieceIdx + 2 : pieceIdx - 2;
}

function canMove(board: Board, pieceIdx: number) {
  return board[fwdIdx(board, pieceIdx)] === 'BLANK';
}

function canJump(board: Board, pieceIdx: number) {
  return board[jumpIdx(board, pieceIdx)] === 'BLANK';
}

export function canAct(board: Board, pieceIdx: number) {
  return canMove(board, pieceIdx) || canJump(board, pieceIdx);
}

export default function GameReducer(state: GameState, action: Action): GameState {
  if (action.kind === 'RESET') {
    return createInitialState(action.numPlayers);
  }

  if (action.kind === 'START_AUTOSOLVE') {
    return {
      ...createInitialState(action.numPlayers),
      isAutosolving: true,
    };
  }

  const newState = { ...state, board: [...state.board] };

  if (action.kind === 'FINISH_AUTOSOLVE') {
    newState.isAutosolving = false;
  }

  if (action.kind === 'MOVE') {
    const { pieceIdx } = action;
    const piece = state.board[pieceIdx];

    let idx = null;
    if (canMove(state.board, pieceIdx)) {
      idx = fwdIdx(state.board, pieceIdx);
    }

    if (canJump(state.board, pieceIdx)) {
      idx = jumpIdx(state.board, pieceIdx);
    }

    if (idx !== null) {
      newState.board[idx] = piece;
      newState.board[pieceIdx] = 'BLANK';
      newState.lastMoveIdx = idx;
    }

    newState.autosolveState = action.autosolveState || null;
  }

  newState.isWinningState = hasWon(newState.board);

  return newState;
}
