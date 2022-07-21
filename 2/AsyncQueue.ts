type Task = (value?: unknown) => Promise<unknown>;

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (value: unknown) => void;
  task: Task;
}

export default class AsyncQueue {
  private readonly _items: QueueItem[] = [];
  private _isPromisePending: boolean = false;

  private _dequeue() {
    return this._items.shift();
  }

  private _enqueue(item: QueueItem) {
    return this._items.push(item);
  }

  add(task: Task) {
    return new Promise((resolve, reject) => {
      this._enqueue({ task, resolve, reject });
      this.pop();
    });
  }

  async pop() {
    if (this._isPromisePending) {
      return;
    }

    const item = this._dequeue();
    if (!item) {
      return;
    }

    try {
      this._isPromisePending = true;
      let payload = await item.task();
      this._isPromisePending = false;

      item.resolve(payload);
    } catch (error) {
      this._isPromisePending = false;
      item.reject(error);
    } finally {
      this.pop();
    }

    return;
  }
}
