import {
  Process,
  StepProcessType,
  SequenceProcessType,
  ParallelProcessType,
  ConditionProcessType,
  StepProcess,
  SequenceProcess,
  ConditionProcess,
  ParallelProcess,
  ProcessType,
} from './types';

interface StepOrConditionProcessInfo {
  index: number;
  type: StepProcessType | ConditionProcessType;
  result?: unknown;
}

interface SequentialOrParallelProcessInfo {
  index: number;
  type: SequenceProcessType | ParallelProcessType;
  children?: ProcessInfo[];
}

type ProcessInfo = StepOrConditionProcessInfo | SequentialOrParallelProcessInfo;

export default class FSM {
  private _history: Partial<ProcessInfo> = {};
  private _currentIndex = 0;
  private static readonly STEP_PROCESS = 'step';
  private static readonly CONDITIONED_PROCESS = 'if';
  private static readonly PARALLEL_PROCESS = 'parallel';
  private static readonly SEQUENTIAL_PROCESS = 'successively';

  async run(process: Process) {
    this._clearHistory();
    await this._run(process, this._history);
  }

  get history() {
    return this._history;
  }

  private _clearHistory() {
    this._history = {};
    this._currentIndex = 0;
  }

  private async _runStepProcess(process: StepProcess, state: Partial<ProcessInfo> | ProcessInfo[]): Promise<unknown> {
    // it's a leaf process, the one which actually does the job
    const args = this._convertToArray(process.args);
    const res = await process.run(...args);
    this._saveStepOrConditionProcessToHistory(state, process.type, res);
    return res;
  }

  private async _runConditionProcess(
    process: ConditionProcess,
    state: Partial<ProcessInfo> | ProcessInfo[]
  ): Promise<unknown> {
    let res: unknown;

    if (process.condition) {
      const args = this._convertToArray(process.then.args);
      res = await process.then.run(...args);
    } else if (process.else) {
      const args = this._convertToArray(process.else.args);
      res = await process.else.run(...args);
    }
    this._saveStepOrConditionProcessToHistory(state, process.type, res);
    return res;
  }

  private async _runSequenceProcess(process: SequenceProcess, state: Partial<ProcessInfo> | ProcessInfo[]) {
    const children = this._saveSequenceOrParallelProcessToHistory(state, process.type);
    for (const subProcess of process.children) {
      await this._run(subProcess, children);
    }
  }

  private async _runParallelProcess(process: ParallelProcess, state: Partial<ProcessInfo> | ProcessInfo[]) {
    const children = this._saveSequenceOrParallelProcessToHistory(state, process.type);
    const childrenPromises = process.children.map(async (el) => {
      return this._runStepProcess(el, children as StepOrConditionProcessInfo[]);
    });
    await Promise.all(childrenPromises);
  }

  /* */

  private async _run(process: Process, state: Partial<ProcessInfo> | ProcessInfo[]) {
    switch (process.type) {
      case FSM.PARALLEL_PROCESS:
        return this._runParallelProcess(process, state);
      case FSM.SEQUENTIAL_PROCESS:
        return this._runSequenceProcess(process, state);
      case FSM.CONDITIONED_PROCESS:
        return this._runConditionProcess(process, state);
      case FSM.STEP_PROCESS:
      default:
        return this._runStepProcess(process, state);
    }
  }

  /* */

  private _saveStepOrConditionProcessToHistory(
    state: Partial<ProcessInfo> | ProcessInfo[],
    type: StepProcessType | ConditionProcessType,
    result: unknown
  ) {
    const index = this._currentIndex++;
    if (this._isInitialStepOrConditionState(state, type)) {
      state.type = type;
      state.index = index;
      state.result = result;
    } else if (Array.isArray(state)) {
      state.push({ index, type, result });
    } else {
      throw new Error('Internal Error. If you see that - call 911');
    }
    console.log(`Saved - index: ${index}, type: ${type}, result: ${JSON.stringify(result, null, 2)}`);
  }

  private _saveSequenceOrParallelProcessToHistory(
    state: Partial<ProcessInfo> | ProcessInfo[],
    type: SequenceProcessType | ParallelProcessType
  ): ProcessInfo[] {
    const index = this._currentIndex++;
    const children: ProcessInfo[] = [];
    if (this._isInitialSequentialOrParallelState(state, type)) {
      // state is an empty object (we're currently in the main process)
      state.type = type;
      state.index = index;
      state.children = children;
    } else if (Array.isArray(state)) {
      state.push({ index, type, children });
    } else {
      throw new Error('Internal Error. If you see that - call 911');
    }
    return children;
  }

  private _isInitialStepOrConditionState(
    state: Partial<ProcessInfo> | ProcessInfo[],
    type: ProcessType
  ): state is StepOrConditionProcessInfo {
    return (type === FSM.STEP_PROCESS || type === FSM.CONDITIONED_PROCESS) && !Array.isArray(state);
  }

  private _isInitialSequentialOrParallelState(
    state: Partial<ProcessInfo> | ProcessInfo[],
    type: ProcessType
  ): state is SequentialOrParallelProcessInfo {
    return (type === FSM.SEQUENTIAL_PROCESS || type === FSM.PARALLEL_PROCESS) && !Array.isArray(state);
  }

  /* */

  private _convertToArray<T>(args: T): T[] {
    return Array.isArray(args) ? args : [args];
  }
}
