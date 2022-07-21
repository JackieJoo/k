import AsyncQueue from './AsyncQueue';

const task = async <T>(value: T) => {
  await new Promise((r) => setTimeout(r, 100 * Math.random()));
  console.log(value);
};

const queue = new AsyncQueue();

async function main(): Promise<void> {
  console.log('Running WITHOUT AsyncQueue...');
  await Promise.all([task(1), task(2), task(3), task(4)]);

  console.log('Running WITH AsyncQueue...');
  await Promise.all([
    queue.add(() => task(1)),
    queue.add(() => task(2)),
    queue.add(() => task(3)),
    queue.add(() => task(4)),
  ]);
}

main();
