import FSM from './FSM';
import { Process } from './types';

const originalProcess: Process = {
  type: 'successively',
  children: [
    {
      type: 'step',
      run: async () => console.log('step 1'),
    },
    {
      type: 'step',
      run: async () => console.log('step 2'),
    },
    {
      type: 'parallel',
      children: [
        {
          type: 'step',
          run: async () => console.log('step 3'),
        },
        {
          type: 'step',
          run: async () => console.log('step 4'),
        },
      ],
    },
    {
      type: 'if',
      condition: 2 > 5,
      then: {
        type: 'step',
        run: async () => console.log('step 5'),
      },
      else: {
        type: 'step',
        run: async () => console.log('step 6'),
      },
    },
  ],
};

const customProcessWithReturnedValueAndArgs: Process = {
  type: 'successively',
  children: [
    {
      type: 'step',
      args: 1,
      run: async (arg1: number) => {
        console.log('step 1');
        return arg1 ** 2;
      },
    },
    {
      type: 'step',
      args: [2, 3],
      run: async (a: number, b: number) => {
        console.log('step 2');
        return (a + b) ** 2;
      },
    },
    {
      type: 'parallel',
      children: [
        {
          type: 'step',
          args: 4,
          run: async (a: number) => {
            console.log('step 3');
            return a ** 2;
          },
        },
        {
          type: 'step',
          run: async () => {
            console.log('step 4');
            return 4;
          },
        },
      ],
    },
    {
      type: 'if',
      condition: 2 > 5,
      then: {
        type: 'step',
        run: async () => {
          console.log('step 5');
          return 5;
        },
      },
      else: {
        type: 'step',
        args: [5, 6],
        run: async (a: number, b: number) => {
          console.log('step 6');
          return (a + b) ** 2;
        },
      },
    },
  ],
};

const state = {
  a: 1,
};

const customProcessWithState: Process = {
  type: 'successively',
  children: [
    {
      type: 'step',
      args: state,
      run: async (state: Record<string, number>) => {
        console.log('step 1');
        state.a = state.a * 2;
        return state;
      },
    },
    {
      type: 'step',
      args: state,
      run: async (state: Record<string, number>) => {
        console.log('step 2');
        state.a = state.a * 3;
        return state;
      },
    },
    {
      type: 'step',
      args: state,
      run: async (state: Record<string, number>) => {
        console.log('step 3');
        state.a = state.a * 3;
        return state;
      },
    },
  ],
};

const fsm = new FSM();

(async () => {
  await fsm.run(originalProcess);
  console.log('Original process state: \n', JSON.stringify(fsm.history, null, 2));
  console.log('=======================================');
  await fsm.run(customProcessWithReturnedValueAndArgs);
  console.log('Process state with returned values and args: \n', JSON.stringify(fsm.history, null, 2));
  console.log('=======================================');
  await fsm.run(customProcessWithState);
  console.log('Process state with "state": \n', JSON.stringify(fsm.history, null, 2));
})();
