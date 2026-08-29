import { env, pipeline } from "@huggingface/transformers";

const MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";
let generatorPromise;

env.allowLocalModels = false;
env.useBrowserCache = true;

function loadGenerator() {
  if (!generatorPromise) {
    const hasWebGpu = Boolean(self.navigator?.gpu);
    generatorPromise = pipeline("text-generation", MODEL_ID, {
      device: hasWebGpu ? "webgpu" : "wasm",
      dtype: hasWebGpu ? "q4f16" : "q4",
      progress_callback: (progress) => {
        self.postMessage({ type: "progress", progress });
      }
    });
  }
  return generatorPromise;
}

self.addEventListener("message", async (event) => {
  if (event.data?.type !== "generate") {
    return;
  }

  try {
    const generator = await loadGenerator();
    self.postMessage({ type: "ready" });
    const output = await generator([
      { role: "system", content: "你是钱迹的本地记账分析助手。只根据用户提供的数据回答，建议简短、谨慎，不承诺理财收益。" },
      { role: "user", content: event.data.prompt }
    ], {
      max_new_tokens: 96,
      do_sample: false,
      repetition_penalty: 1.15,
      no_repeat_ngram_size: 3
    });
    const generated = output?.[0]?.generated_text;
    const text = Array.isArray(generated)
      ? generated.at(-1)?.content
      : String(generated || "").trim();
    self.postMessage({ type: "result", requestId: event.data.requestId, text });
  } catch (error) {
    generatorPromise = undefined;
    self.postMessage({ type: "error", requestId: event.data.requestId, message: error?.message || "模型加载失败" });
  }
});
