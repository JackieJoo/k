export type ProcessTask = (...values: any[]) => Promise<unknown>;

export type StepProcessType = 'step';
export type ParallelProcessType = 'parallel';
export type ConditionProcessType = 'if';
export type SequenceProcessType = 'successively';

export type ProcessType = StepProcessType | ConditionProcessType | ParallelProcessType | SequenceProcessType;
export type Process = StepProcess | ParallelProcess | ConditionProcess | SequenceProcess;

export interface StepProcess {
  args?: any;
  type: StepProcessType;
  run: ProcessTask;
}

export interface ParallelProcess {
  type: ParallelProcessType;
  children: Array<StepProcess>; // Assuming Parallel process can consist of Step processes only
}

export interface ConditionProcess {
  type: ConditionProcessType;
  condition: boolean;
  then: StepProcess;
  else?: StepProcess;
}

export interface SequenceProcess {
  type: SequenceProcessType;
  children: Array<Process>;
}
