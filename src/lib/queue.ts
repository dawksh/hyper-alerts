import type { Alert, User } from "@prisma/client";
import { Worker } from "worker_threads";
import path from "path";

let queue: { alert: Alert & { user: User }; price: number }[] = [];
let activeWorkers = 0;
const MAX_WORKERS = 5;
const workers: Worker[] = [];

const startWorker = (senders: { telegram: any; twilio: any; prisma: any }) => {
  if (activeWorkers >= MAX_WORKERS || queue.length === 0) return;
  activeWorkers++;
  const task = queue.shift();
  if (!task) {
    activeWorkers--;
    return;
  }
  const worker = new Worker(path.resolve(__dirname, "queueWorker.js"), {
    workerData: {
      task,
      senders: { hasTelegram: !!senders.telegram, hasTwilio: !!senders.twilio },
    },
  });
  workers.push(worker);
  worker.on("message", async (msg) => {
    if (msg === "done") {
      activeWorkers--;
      workers.splice(workers.indexOf(worker), 1);
      if (queue.length > 0) startWorker(senders);
    }
  });
  worker.on("error", () => {
    activeWorkers--;
    workers.splice(workers.indexOf(worker), 1);
    if (queue.length > 0) startWorker(senders);
  });
  worker.on("exit", () => {
    activeWorkers--;
    workers.splice(workers.indexOf(worker), 1);
    if (queue.length > 0) startWorker(senders);
  });
};

const enqueue = (
  task: { alert: Alert & { user: User }; price: number },
  senders: { telegram: any; twilio: any; prisma: any }
) => {
  queue.push(task);
  startWorker(senders);
};

const enqueueBatch = (
  tasks: { alert: Alert & { user: User }; price: number }[],
  senders: { telegram: any; twilio: any; prisma: any }
) => {
  queue = queue.concat(tasks);
  for (let i = 0; i < MAX_WORKERS; i++) startWorker(senders);
};

export { enqueue, enqueueBatch };
